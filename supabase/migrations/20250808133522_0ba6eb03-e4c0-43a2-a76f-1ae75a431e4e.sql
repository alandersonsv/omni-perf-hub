-- MIGRATION: Core billing, dashboards customization, WooCommerce read-only, and sync observability
-- 1) Enums
DO $$ BEGIN
  CREATE TYPE public.integration_type AS ENUM ('meta_ads','google_ads','ga4','search_console','tiktok_ads','woocommerce');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend existing platform_type used by public.integrations
DO $$ BEGIN
  ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'tiktok_ads';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE public.platform_type ADD VALUE IF NOT EXISTS 'woocommerce';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.sync_job_type AS ENUM ('initial','incremental','webhook','reindex');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE TYPE public.sync_status AS ENUM ('queued','running','success','error');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Billing tables (Stripe)
CREATE TABLE IF NOT EXISTS public.plans (
  id                 TEXT PRIMARY KEY, -- e.g., "starter", "pro", "enterprise"
  name               TEXT NOT NULL,
  description        TEXT,
  price_cents        INTEGER NOT NULL,
  currency           TEXT NOT NULL DEFAULT 'usd',
  stripe_price_id    TEXT,
  features           JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Plans are readable by everyone" ON public.plans FOR SELECT USING (true);
DROP TRIGGER IF EXISTS trg_update_plans_updated_at ON public.plans;
CREATE TRIGGER trg_update_plans_updated_at
BEFORE UPDATE ON public.plans
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TABLE IF NOT EXISTS public.subscribers (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email               TEXT NOT NULL UNIQUE,
  stripe_customer_id  TEXT,
  subscribed          BOOLEAN NOT NULL DEFAULT FALSE,
  subscription_tier   TEXT,
  subscription_end    TIMESTAMPTZ,
  agency_id           UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
-- Users can view/update/insert their own subscriber record
CREATE POLICY IF NOT EXISTS "select_own_subscription" ON public.subscribers
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());
CREATE POLICY IF NOT EXISTS "update_own_subscription" ON public.subscribers
  FOR UPDATE USING (user_id = auth.uid() OR email = auth.email());
CREATE POLICY IF NOT EXISTS "insert_own_subscription" ON public.subscribers
  FOR INSERT WITH CHECK (user_id = auth.uid() OR email = auth.email());

CREATE TABLE IF NOT EXISTS public.invoices (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             UUID,
  email               TEXT,
  stripe_invoice_id   TEXT UNIQUE,
  status              TEXT,
  amount_cents        INTEGER,
  currency            TEXT DEFAULT 'usd',
  period_start        TIMESTAMPTZ,
  period_end          TIMESTAMPTZ,
  hosted_invoice_url  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "read_own_invoices" ON public.invoices
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());
DROP TRIGGER IF EXISTS trg_update_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TABLE IF NOT EXISTS public.billing_events (
  id                BIGSERIAL PRIMARY KEY,
  user_id           UUID,
  email             TEXT,
  type              TEXT NOT NULL,
  stripe_object_id  TEXT,
  payload           JSONB,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "read_own_billing_events" ON public.billing_events
  FOR SELECT USING (user_id = auth.uid() OR email = auth.email());

-- 3) Dashboard customization
CREATE TABLE IF NOT EXISTS public.dashboard_templates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  platform     public.platform_type,
  config       JSONB NOT NULL DEFAULT '{}'::jsonb, -- widgets, layout, defaults
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dashboard_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Templates are readable by everyone" ON public.dashboard_templates FOR SELECT USING (true);
DROP TRIGGER IF EXISTS trg_update_dashboard_templates_updated_at ON public.dashboard_templates;
CREATE TRIGGER trg_update_dashboard_templates_updated_at
BEFORE UPDATE ON public.dashboard_templates
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TABLE IF NOT EXISTS public.dashboards (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id      UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  owner_user_id  UUID NOT NULL,
  title          TEXT NOT NULL,
  description    TEXT,
  layout         JSONB NOT NULL DEFAULT '[]'::jsonb, -- grid positions
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dashboards ENABLE ROW LEVEL SECURITY;
-- View: any member of the agency
CREATE POLICY IF NOT EXISTS "Agency members can view dashboards" ON public.dashboards
  FOR SELECT USING (
    auth.uid() IN (
      SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = dashboards.agency_id
    )
  );
-- Manage: owner or agency admin/owner
CREATE POLICY IF NOT EXISTS "Owners/Admins can manage dashboards" ON public.dashboards
  FOR ALL USING (
    auth.uid() IN (
      SELECT tm.id FROM public.team_members tm
      WHERE tm.agency_id = dashboards.agency_id AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    ) OR owner_user_id = auth.uid()
  ) WITH CHECK (
    auth.uid() IN (
      SELECT tm.id FROM public.team_members tm
      WHERE tm.agency_id = dashboards.agency_id AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    ) OR owner_user_id = auth.uid()
  );
DROP TRIGGER IF EXISTS trg_update_dashboards_updated_at ON public.dashboards;
CREATE TRIGGER trg_update_dashboards_updated_at
BEFORE UPDATE ON public.dashboards
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TABLE IF NOT EXISTS public.dashboard_widgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id  UUID NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  type          TEXT NOT NULL, -- e.g., line_chart, bar_chart, kpi, table
  title         TEXT,
  position      JSONB NOT NULL DEFAULT '{}'::jsonb, -- x,y,w,h
  config        JSONB NOT NULL DEFAULT '{}'::jsonb, -- visual options
  query         JSONB NOT NULL DEFAULT '{}'::jsonb, -- data source/metric formula
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.dashboard_widgets ENABLE ROW LEVEL SECURITY;
-- View widgets if can view dashboard
CREATE POLICY IF NOT EXISTS "Agency members can view dashboard widgets" ON public.dashboard_widgets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.dashboards d
      JOIN public.team_members tm ON tm.agency_id = d.agency_id
      WHERE d.id = dashboard_widgets.dashboard_id AND tm.id = auth.uid()
    )
  );
-- Manage widgets if can manage dashboard
CREATE POLICY IF NOT EXISTS "Owners/Admins can manage dashboard widgets" ON public.dashboard_widgets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.dashboards d
      JOIN public.team_members tm ON tm.agency_id = d.agency_id
      WHERE d.id = dashboard_widgets.dashboard_id
        AND (tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role]) OR d.owner_user_id = auth.uid())
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dashboards d
      JOIN public.team_members tm ON tm.agency_id = d.agency_id
      WHERE d.id = dashboard_widgets.dashboard_id
        AND (tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role]) OR d.owner_user_id = auth.uid())
    )
  );
DROP TRIGGER IF EXISTS trg_update_dashboard_widgets_updated_at ON public.dashboard_widgets;
CREATE TRIGGER trg_update_dashboard_widgets_updated_at
BEFORE UPDATE ON public.dashboard_widgets
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

CREATE TABLE IF NOT EXISTS public.user_metrics (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id    UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL,
  name         TEXT NOT NULL,
  expression   TEXT NOT NULL, -- formula string, parsed client-side/edge
  description  TEXT,
  is_public    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
-- Read: agency members; if not owner of metric then must be public
CREATE POLICY IF NOT EXISTS "Read metrics in agency" ON public.user_metrics
  FOR SELECT USING (
    auth.uid() IN (SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = user_metrics.agency_id)
    AND (is_public OR user_id = auth.uid())
  );
-- Manage: creator or agency admins
CREATE POLICY IF NOT EXISTS "Manage own or admin metrics" ON public.user_metrics
  FOR ALL USING (
    user_id = auth.uid() OR auth.uid() IN (
      SELECT tm.id FROM public.team_members tm
      WHERE tm.agency_id = user_metrics.agency_id AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    user_id = auth.uid() OR auth.uid() IN (
      SELECT tm.id FROM public.team_members tm
      WHERE tm.agency_id = user_metrics.agency_id AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_user_metrics_updated_at ON public.user_metrics;
CREATE TRIGGER trg_update_user_metrics_updated_at
BEFORE UPDATE ON public.user_metrics
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- 4) WooCommerce read-only data model
CREATE TABLE IF NOT EXISTS public.shops (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id                  UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
  name                       TEXT,
  url                        TEXT NOT NULL,
  consumer_key_encrypted     TEXT NOT NULL,
  consumer_secret_encrypted  TEXT NOT NULL,
  status                     TEXT NOT NULL DEFAULT 'disconnected',
  webhook_secret             TEXT,
  last_synced_at             TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agency_id, url)
);
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
-- View: any member of the agency
CREATE POLICY IF NOT EXISTS "Agency members can view shops" ON public.shops
  FOR SELECT USING (auth.uid() IN (SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = shops.agency_id));
-- Manage: admins/owners
CREATE POLICY IF NOT EXISTS "Agency admins can manage shops" ON public.shops
  FOR ALL USING (
    auth.uid() IN (
      SELECT tm.id FROM public.team_members tm
      WHERE tm.agency_id = shops.agency_id AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    auth.uid() IN (
      SELECT tm.id FROM public.team_members tm
      WHERE tm.agency_id = shops.agency_id AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_shops_updated_at ON public.shops;
CREATE TRIGGER trg_update_shops_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE INDEX IF NOT EXISTS idx_shops_agency ON public.shops(agency_id);

CREATE TABLE IF NOT EXISTS public.categories (
  id           BIGSERIAL PRIMARY KEY,
  shop_id      UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  wc_id        BIGINT NOT NULL,
  name         TEXT,
  slug         TEXT,
  parent_wcid  BIGINT,
  data         JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, wc_id)
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view categories" ON public.categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = categories.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage categories" ON public.categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = categories.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = categories.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_categories_updated_at ON public.categories;
CREATE TRIGGER trg_update_categories_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE INDEX IF NOT EXISTS idx_categories_shop ON public.categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_categories_wc_id ON public.categories(wc_id);

CREATE TABLE IF NOT EXISTS public.products (
  id              BIGSERIAL PRIMARY KEY,
  shop_id         UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  wc_id           BIGINT NOT NULL,
  name            TEXT,
  sku             TEXT,
  price           NUMERIC,
  stock_quantity  INTEGER,
  status          TEXT,
  categories      JSONB NOT NULL DEFAULT '[]'::jsonb,
  data            JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, wc_id)
);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view products" ON public.products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = products.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage products" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = products.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = products.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_products_updated_at ON public.products;
CREATE TRIGGER trg_update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE INDEX IF NOT EXISTS idx_products_shop ON public.products(shop_id);
CREATE INDEX IF NOT EXISTS idx_products_wc_id ON public.products(wc_id);

CREATE TABLE IF NOT EXISTS public.product_variations (
  id                 BIGSERIAL PRIMARY KEY,
  shop_id            UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  wc_id              BIGINT NOT NULL,
  parent_product_wcid BIGINT NOT NULL,
  sku                TEXT,
  price              NUMERIC,
  stock_quantity     INTEGER,
  status             TEXT,
  data               JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, wc_id)
);
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view product variations" ON public.product_variations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = product_variations.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage product variations" ON public.product_variations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = product_variations.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = product_variations.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_product_variations_updated_at ON public.product_variations;
CREATE TRIGGER trg_update_product_variations_updated_at
BEFORE UPDATE ON public.product_variations
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE INDEX IF NOT EXISTS idx_product_variations_shop ON public.product_variations(shop_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_parent ON public.product_variations(parent_product_wcid);

CREATE TABLE IF NOT EXISTS public.customers (
  id          BIGSERIAL PRIMARY KEY,
  shop_id     UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  wc_id       BIGINT NOT NULL,
  email       TEXT,
  first_name  TEXT,
  last_name   TEXT,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, wc_id)
);
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view customers" ON public.customers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = customers.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = customers.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = customers.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_customers_updated_at ON public.customers;
CREATE TRIGGER trg_update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE INDEX IF NOT EXISTS idx_customers_shop ON public.customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_customers_wc_id ON public.customers(wc_id);

CREATE TABLE IF NOT EXISTS public.orders (
  id               BIGSERIAL PRIMARY KEY,
  shop_id          UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  wc_id            BIGINT NOT NULL,
  status           TEXT,
  customer_wcid    BIGINT,
  total            NUMERIC,
  subtotal         NUMERIC,
  discount_total   NUMERIC,
  shipping_total   NUMERIC,
  currency         TEXT,
  order_created_at TIMESTAMPTZ, -- Woo order date
  data             JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, wc_id)
);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view orders" ON public.orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = orders.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage orders" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = orders.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = orders.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_orders_updated_at ON public.orders;
CREATE TRIGGER trg_update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE INDEX IF NOT EXISTS idx_orders_shop ON public.orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(order_created_at);

CREATE TABLE IF NOT EXISTS public.order_items (
  id             BIGSERIAL PRIMARY KEY,
  shop_id        UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  order_wcid     BIGINT NOT NULL,
  line_item_id   BIGINT NOT NULL,
  product_wcid   BIGINT,
  variation_wcid BIGINT,
  quantity       INTEGER,
  price          NUMERIC,
  total          NUMERIC,
  data           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (shop_id, order_wcid, line_item_id)
);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = order_items.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage order items" ON public.order_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = order_items.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = order_items.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
CREATE INDEX IF NOT EXISTS idx_order_items_shop_order ON public.order_items(shop_id, order_wcid);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON public.order_items(product_wcid);

CREATE TABLE IF NOT EXISTS public.products_categories (
  shop_id        UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  product_wcid   BIGINT NOT NULL,
  category_wcid  BIGINT NOT NULL,
  PRIMARY KEY (shop_id, product_wcid, category_wcid)
);
ALTER TABLE public.products_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view products_categories" ON public.products_categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = products_categories.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage products_categories" ON public.products_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = products_categories.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = products_categories.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );

-- 5) Sync jobs & logs for observability
CREATE TABLE IF NOT EXISTS public.sync_jobs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id      UUID NOT NULL REFERENCES public.shops(id) ON DELETE CASCADE,
  type         public.sync_job_type NOT NULL,
  status       public.sync_status NOT NULL DEFAULT 'queued',
  started_at   TIMESTAMPTZ,
  finished_at  TIMESTAMPTZ,
  stats        JSONB NOT NULL DEFAULT '{}'::jsonb,
  error        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view sync jobs" ON public.sync_jobs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id WHERE s.id = sync_jobs.shop_id AND tm.id = auth.uid())
  );
CREATE POLICY IF NOT EXISTS "Agency admins can manage sync jobs" ON public.sync_jobs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = sync_jobs.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.shops s JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE s.id = sync_jobs.shop_id AND tm.id = auth.uid() AND tm.role = ANY(ARRAY['owner'::user_role,'admin'::user_role])
    )
  );
DROP TRIGGER IF EXISTS trg_update_sync_jobs_updated_at ON public.sync_jobs;
CREATE TRIGGER trg_update_sync_jobs_updated_at
BEFORE UPDATE ON public.sync_jobs
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE INDEX IF NOT EXISTS idx_sync_jobs_shop ON public.sync_jobs(shop_id);
CREATE INDEX IF NOT EXISTS idx_sync_jobs_status ON public.sync_jobs(status);

CREATE TABLE IF NOT EXISTS public.sync_logs (
  id         BIGSERIAL PRIMARY KEY,
  job_id     UUID NOT NULL REFERENCES public.sync_jobs(id) ON DELETE CASCADE,
  level      TEXT NOT NULL DEFAULT 'info',
  message    TEXT NOT NULL,
  details    JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Agency members can view sync logs" ON public.sync_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.sync_jobs j
      JOIN public.shops s ON s.id = j.shop_id
      JOIN public.team_members tm ON tm.agency_id = s.agency_id
      WHERE j.id = sync_logs.job_id AND tm.id = auth.uid()
    )
  );

-- Helpful indexes for analytics
CREATE INDEX IF NOT EXISTS idx_orders_totals_by_date ON public.orders(shop_id, order_created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_product_shop ON public.order_items(shop_id, product_wcid);

-- End of migration
