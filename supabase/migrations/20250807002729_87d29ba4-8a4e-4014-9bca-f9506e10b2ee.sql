-- Create enums (with IF NOT EXISTS to avoid conflicts)
DO $$ BEGIN
    CREATE TYPE public.subscription_plan AS ENUM ('trial', 'basic', 'premium');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.platform_type AS ENUM ('meta_ads', 'google_ads', 'ga4', 'search_console');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.report_frequency AS ENUM ('daily', 'weekly', 'monthly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.alert_type AS ENUM ('low_budget', 'account_blocked', 'api_error', 'performance_drop');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('owner', 'admin', 'analyst', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.connection_status AS ENUM ('disconnected', 'pending', 'connected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create agencies table
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    subscription_plan subscription_plan DEFAULT 'trial',
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '14 days'),
    n8n_instance_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agency_clients table
CREATE TABLE IF NOT EXISTS public.agency_clients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    cnpj TEXT,
    phone TEXT,
    email TEXT,
    whatsapp_number TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create integrations table
CREATE TABLE IF NOT EXISTS public.integrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    account_id TEXT NOT NULL,
    credentials JSONB,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports_config table
CREATE TABLE IF NOT EXISTS public.reports_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.agency_clients(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    metrics JSONB NOT NULL DEFAULT '[]',
    message_template TEXT,
    frequency report_frequency DEFAULT 'weekly',
    send_time TIME DEFAULT '09:00',
    send_days JSONB DEFAULT '[1,2,3,4,5]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts_config table
CREATE TABLE IF NOT EXISTS public.alerts_config (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    alert_type alert_type NOT NULL,
    threshold_value DECIMAL,
    platforms JSONB DEFAULT '[]',
    notify_time TIME DEFAULT '09:00',
    is_active BOOLEAN DEFAULT false,
    webhook_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role user_role DEFAULT 'viewer',
    permissions JSONB DEFAULT '{}',
    invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    accepted_at TIMESTAMP WITH TIME ZONE
);

-- Create whatsapp_connections table
CREATE TABLE IF NOT EXISTS public.whatsapp_connections (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    qr_code TEXT,
    status connection_status DEFAULT 'disconnected',
    evolution_session_id TEXT,
    connected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for agencies
DROP POLICY IF EXISTS "Users can view their own agency" ON public.agencies;
CREATE POLICY "Users can view their own agency" ON public.agencies
    FOR SELECT USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = agencies.id
    ));

DROP POLICY IF EXISTS "Users can update their own agency" ON public.agencies;
CREATE POLICY "Users can update their own agency" ON public.agencies
    FOR UPDATE USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm 
        WHERE tm.agency_id = agencies.id AND tm.role IN ('owner', 'admin')
    ));

-- Create RLS policies for agency_clients
DROP POLICY IF EXISTS "Agency members can view clients" ON public.agency_clients;
CREATE POLICY "Agency members can view clients" ON public.agency_clients
    FOR SELECT USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = agency_clients.agency_id
    ));

DROP POLICY IF EXISTS "Agency members can manage clients" ON public.agency_clients;
CREATE POLICY "Agency members can manage clients" ON public.agency_clients
    FOR ALL USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm 
        WHERE tm.agency_id = agency_clients.agency_id AND tm.role IN ('owner', 'admin', 'analyst')
    ));

-- Create RLS policies for integrations
DROP POLICY IF EXISTS "Agency members can view integrations" ON public.integrations;
CREATE POLICY "Agency members can view integrations" ON public.integrations
    FOR SELECT USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = integrations.agency_id
    ));

DROP POLICY IF EXISTS "Agency admins can manage integrations" ON public.integrations;
CREATE POLICY "Agency admins can manage integrations" ON public.integrations
    FOR ALL USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm 
        WHERE tm.agency_id = integrations.agency_id AND tm.role IN ('owner', 'admin')
    ));

-- Create RLS policies for reports_config
DROP POLICY IF EXISTS "Agency members can view reports config" ON public.reports_config;
CREATE POLICY "Agency members can view reports config" ON public.reports_config
    FOR SELECT USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = reports_config.agency_id
    ));

DROP POLICY IF EXISTS "Agency members can manage reports config" ON public.reports_config;
CREATE POLICY "Agency members can manage reports config" ON public.reports_config
    FOR ALL USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm 
        WHERE tm.agency_id = reports_config.agency_id AND tm.role IN ('owner', 'admin', 'analyst')
    ));

-- Create RLS policies for alerts_config
DROP POLICY IF EXISTS "Agency members can view alerts config" ON public.alerts_config;
CREATE POLICY "Agency members can view alerts config" ON public.alerts_config
    FOR SELECT USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = alerts_config.agency_id
    ));

DROP POLICY IF EXISTS "Agency members can manage alerts config" ON public.alerts_config;
CREATE POLICY "Agency members can manage alerts config" ON public.alerts_config
    FOR ALL USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm 
        WHERE tm.agency_id = alerts_config.agency_id AND tm.role IN ('owner', 'admin', 'analyst')
    ));

-- Create RLS policies for team_members
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
CREATE POLICY "Agency members can view team" ON public.team_members
    FOR SELECT USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = team_members.agency_id
    ));

DROP POLICY IF EXISTS "Agency owners/admins can manage team" ON public.team_members;
CREATE POLICY "Agency owners/admins can manage team" ON public.team_members
    FOR ALL USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm 
        WHERE tm.agency_id = team_members.agency_id AND tm.role IN ('owner', 'admin')
    ));

-- Create RLS policies for whatsapp_connections
DROP POLICY IF EXISTS "Agency members can view whatsapp connections" ON public.whatsapp_connections;
CREATE POLICY "Agency members can view whatsapp connections" ON public.whatsapp_connections
    FOR SELECT USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = whatsapp_connections.agency_id
    ));

DROP POLICY IF EXISTS "Agency admins can manage whatsapp connections" ON public.whatsapp_connections;
CREATE POLICY "Agency admins can manage whatsapp connections" ON public.whatsapp_connections
    FOR ALL USING (auth.uid() IN (
        SELECT tm.id FROM public.team_members tm 
        WHERE tm.agency_id = whatsapp_connections.agency_id AND tm.role IN ('owner', 'admin')
    ));

-- Create updated_at triggers
DROP TRIGGER IF EXISTS update_agencies_updated_at ON public.agencies;
CREATE TRIGGER update_agencies_updated_at
    BEFORE UPDATE ON public.agencies
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_agency_clients_updated_at ON public.agency_clients;
CREATE TRIGGER update_agency_clients_updated_at
    BEFORE UPDATE ON public.agency_clients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_integrations_updated_at ON public.integrations;
CREATE TRIGGER update_integrations_updated_at
    BEFORE UPDATE ON public.integrations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_reports_config_updated_at ON public.reports_config;
CREATE TRIGGER update_reports_config_updated_at
    BEFORE UPDATE ON public.reports_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_alerts_config_updated_at ON public.alerts_config;
CREATE TRIGGER update_alerts_config_updated_at
    BEFORE UPDATE ON public.alerts_config
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

DROP TRIGGER IF EXISTS update_whatsapp_connections_updated_at ON public.whatsapp_connections;
CREATE TRIGGER update_whatsapp_connections_updated_at
    BEFORE UPDATE ON public.whatsapp_connections
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();