-- Create client_accounts table to map clients to platform accounts
-- This table establishes the relationship between agency clients and their integration accounts

CREATE TABLE IF NOT EXISTS public.client_accounts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agency_id UUID NOT NULL REFERENCES public.agencies(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES public.agency_clients(id) ON DELETE CASCADE,
    integration_id UUID NOT NULL REFERENCES public.integrations(id) ON DELETE CASCADE,
    platform platform_type NOT NULL,
    account_id TEXT NOT NULL,
    account_name TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Ensure unique mapping per client-platform-account combination
    UNIQUE(client_id, platform, account_id)
);

-- Enable RLS on client_accounts table
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for client_accounts
DROP POLICY IF EXISTS "Agency members can view client accounts" ON public.client_accounts;
CREATE POLICY "Agency members can view client accounts" ON public.client_accounts
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = client_accounts.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage client accounts" ON public.client_accounts;
CREATE POLICY "Agency admins can manage client accounts" ON public.client_accounts
    FOR ALL USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = client_accounts.agency_id 
              AND tm.role IN ('owner', 'admin', 'analyst')
        )
    )
    WITH CHECK (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = client_accounts.agency_id 
              AND tm.role IN ('owner', 'admin', 'analyst')
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_accounts_agency_id ON public.client_accounts (agency_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_client_id ON public.client_accounts (client_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_integration_id ON public.client_accounts (integration_id);
CREATE INDEX IF NOT EXISTS idx_client_accounts_platform ON public.client_accounts (platform);

-- Add trigger to update updated_at column
DROP TRIGGER IF EXISTS update_client_accounts_updated_at ON public.client_accounts;
CREATE TRIGGER update_client_accounts_updated_at
    BEFORE UPDATE ON public.client_accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_modified_column();

-- Add comments for documentation
COMMENT ON TABLE public.client_accounts IS 'Maps agency clients to their platform integration accounts for multi-tenancy support';
COMMENT ON COLUMN public.client_accounts.agency_id IS 'Reference to the agency that owns this mapping';
COMMENT ON COLUMN public.client_accounts.client_id IS 'Reference to the specific client';
COMMENT ON COLUMN public.client_accounts.integration_id IS 'Reference to the platform integration';
COMMENT ON COLUMN public.client_accounts.platform IS 'Platform type (meta_ads, google_ads, ga4, search_console)';
COMMENT ON COLUMN public.client_accounts.account_id IS 'Platform-specific account identifier';
COMMENT ON COLUMN public.client_accounts.account_name IS 'Human-readable account name for display purposes';
COMMENT ON COLUMN public.client_accounts.is_active IS 'Whether this account mapping is currently active';