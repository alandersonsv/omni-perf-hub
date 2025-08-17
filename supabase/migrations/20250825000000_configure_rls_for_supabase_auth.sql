-- Configure RLS policies for Supabase Auth integration
-- This migration sets up proper Row Level Security for production use

-- Update RLS policies to work with Supabase Auth instead of mock authentication

-- Update agencies policies
DROP POLICY IF EXISTS "Users can view their own agency" ON public.agencies;
CREATE POLICY "Users can view their own agency" ON public.agencies
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = agencies.id
        )
    );

DROP POLICY IF EXISTS "Users can update their own agency" ON public.agencies;
CREATE POLICY "Users can update their own agency" ON public.agencies
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = agencies.id AND tm.role IN ('owner', 'admin')
        )
    );

-- Update agency_clients policies
DROP POLICY IF EXISTS "Agency members can view clients" ON public.agency_clients;
CREATE POLICY "Agency members can view clients" ON public.agency_clients
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = agency_clients.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency members can manage clients" ON public.agency_clients;
CREATE POLICY "Agency members can manage clients" ON public.agency_clients
    FOR ALL USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = agency_clients.agency_id AND tm.role IN ('owner', 'admin', 'analyst')
        )
    );

-- Update team_members policies
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
CREATE POLICY "Agency members can view team" ON public.team_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.agency_id = team_members.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency owners/admins can manage team" ON public.team_members;
CREATE POLICY "Agency owners/admins can manage team" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.agency_id = team_members.agency_id AND tm.role IN ('owner', 'admin')
        )
    );

-- Add policy for users to insert themselves as team members (for registration)
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON public.team_members;
CREATE POLICY "Users can insert themselves as team members" ON public.team_members
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- Update integrations policies
DROP POLICY IF EXISTS "Agency members can view integrations" ON public.integrations;
CREATE POLICY "Agency members can view integrations" ON public.integrations
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = integrations.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage integrations" ON public.integrations;
CREATE POLICY "Agency admins can manage integrations" ON public.integrations
    FOR ALL USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = integrations.agency_id AND tm.role IN ('owner', 'admin')
        )
    );

-- Update client_accounts policies
DROP POLICY IF EXISTS "Agency members can view client accounts" ON public.client_accounts;
CREATE POLICY "Agency members can view client accounts" ON public.client_accounts
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = client_accounts.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage client accounts" ON public.client_accounts;
CREATE POLICY "Agency admins can manage client accounts" ON public.client_accounts
    FOR ALL USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = client_accounts.agency_id AND tm.role IN ('owner', 'admin')
        )
    );

-- Update data tables policies (meta_ads_insights_daily, google_ads_campaigns_kpi, ga4_daily)
DROP POLICY IF EXISTS "Agency members can view meta ads insights" ON public.meta_ads_insights_daily;
CREATE POLICY "Agency members can view meta ads insights" ON public.meta_ads_insights_daily
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = meta_ads_insights_daily.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage meta ads insights" ON public.meta_ads_insights_daily;
CREATE POLICY "Agency admins can manage meta ads insights" ON public.meta_ads_insights_daily
    FOR ALL USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = meta_ads_insights_daily.agency_id AND tm.role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "Agency members can view Google Ads campaign data" ON public.google_ads_campaigns_kpi;
CREATE POLICY "Agency members can view Google Ads campaign data" ON public.google_ads_campaigns_kpi
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = google_ads_campaigns_kpi.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage Google Ads campaign data" ON public.google_ads_campaigns_kpi;
CREATE POLICY "Agency admins can manage Google Ads campaign data" ON public.google_ads_campaigns_kpi
    FOR ALL USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = google_ads_campaigns_kpi.agency_id AND tm.role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS "Agency members can view GA4" ON public.ga4_daily;
CREATE POLICY "Agency members can view GA4" ON public.ga4_daily
    FOR SELECT USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm WHERE tm.agency_id = ga4_daily.agency_id
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage GA4" ON public.ga4_daily;
CREATE POLICY "Agency admins can manage GA4" ON public.ga4_daily
    FOR ALL USING (
        auth.uid() IN (
            SELECT tm.id FROM public.team_members tm 
            WHERE tm.agency_id = ga4_daily.agency_id AND tm.role IN ('owner', 'admin')
        )
    );

-- Ensure RLS is enabled on all tables
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meta_ads_insights_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_ads_campaigns_kpi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ga4_daily ENABLE ROW LEVEL SECURITY;