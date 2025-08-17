-- Optimize RLS policies performance by caching auth function calls
-- Replace direct auth.uid() calls with subqueries (select auth.uid()) for better performance

-- Optimize google_ads_campaigns_kpi policies
DROP POLICY IF EXISTS "Agency members can view Google Ads campaign data" ON public.google_ads_campaigns_kpi;
CREATE POLICY "Agency members can view Google Ads campaign data"
ON public.google_ads_campaigns_kpi
FOR SELECT
USING (
  (select auth.uid()) IN (
    SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = google_ads_campaigns_kpi.agency_id
  )
);

DROP POLICY IF EXISTS "Agency admins can manage Google Ads campaign data" ON public.google_ads_campaigns_kpi;
CREATE POLICY "Agency admins can manage Google Ads campaign data"
ON public.google_ads_campaigns_kpi
FOR ALL
USING (
  (select auth.uid()) IN (
    SELECT tm.id FROM public.team_members tm
    WHERE tm.agency_id = google_ads_campaigns_kpi.agency_id
      AND tm.role IN ('owner', 'admin')
  )
)
WITH CHECK (
  (select auth.uid()) IN (
    SELECT tm.id FROM public.team_members tm
    WHERE tm.agency_id = google_ads_campaigns_kpi.agency_id
      AND tm.role IN ('owner', 'admin')
  )
);

-- Optimize other tables with similar performance issues
-- Fix team_members policies
DROP POLICY IF EXISTS "Users can view own team record" ON public.team_members;
CREATE POLICY "Users can view own team record" ON public.team_members
    FOR SELECT USING (
        (select auth.uid()) = id
    );

DROP POLICY IF EXISTS "Users can insert themselves as team members" ON public.team_members;
CREATE POLICY "Users can insert themselves as team members" ON public.team_members
    FOR INSERT WITH CHECK (
        (select auth.uid()) = id
    );

DROP POLICY IF EXISTS "Users can update own team record" ON public.team_members;
CREATE POLICY "Users can update own team record" ON public.team_members
    FOR UPDATE USING (
        (select auth.uid()) = id
    ) WITH CHECK (
        (select auth.uid()) = id
    );

-- Optimize agencies policies
DROP POLICY IF EXISTS "Users can view their own agency" ON public.agencies;
CREATE POLICY "Users can view their own agency" ON public.agencies
    FOR SELECT USING (
        id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Users can update their own agency" ON public.agencies;
CREATE POLICY "Users can update their own agency" ON public.agencies
    FOR UPDATE USING (
        id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    );

-- Optimize integrations policies
DROP POLICY IF EXISTS "Agency members can access integrations" ON public.integrations;
CREATE POLICY "Agency members can access integrations" ON public.integrations
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage integrations" ON public.integrations;
CREATE POLICY "Agency admins can manage integrations" ON public.integrations
    FOR ALL USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    );

-- Optimize dashboards policies
DROP POLICY IF EXISTS "Agency members can access dashboards" ON public.dashboards;
CREATE POLICY "Agency members can access dashboards" ON public.dashboards
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Agency owners/admins can manage dashboards" ON public.dashboards;
CREATE POLICY "Agency owners/admins can manage dashboards" ON public.dashboards
    FOR ALL USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    );

-- Optimize whatsapp_connections policies
DROP POLICY IF EXISTS "Agency members can access whatsapp connections" ON public.whatsapp_connections;
CREATE POLICY "Agency members can access whatsapp connections" ON public.whatsapp_connections
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = (select auth.uid())
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage whatsapp connections" ON public.whatsapp_connections;
CREATE POLICY "Agency admins can manage whatsapp connections" ON public.whatsapp_connections
    FOR ALL USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = (select auth.uid()) AND tm.role IN ('owner', 'admin')
        )
    );

COMMIT;