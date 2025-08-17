-- Fix duplicate RLS policies that cause performance issues
-- This migration consolidates multiple permissive policies into single, efficient policies

-- Fix dashboards table - consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Agency members can view dashboards" ON public.dashboards;
DROP POLICY IF EXISTS "Owners/Admins can manage dashboards" ON public.dashboards;

-- Create single consolidated policy for dashboards SELECT
CREATE POLICY "Agency members can access dashboards" ON public.dashboards
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = auth.uid()
        )
    );

-- Create separate policy for dashboards management (INSERT, UPDATE, DELETE)
CREATE POLICY "Agency owners/admins can manage dashboards" ON public.dashboards
    FOR ALL USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

-- Fix whatsapp_connections table - consolidate multiple SELECT policies
DROP POLICY IF EXISTS "Agency members can view whatsapp connections" ON public.whatsapp_connections;
DROP POLICY IF EXISTS "Agency admins can manage whatsapp connections" ON public.whatsapp_connections;

-- Create single consolidated policy for whatsapp_connections SELECT
CREATE POLICY "Agency members can access whatsapp connections" ON public.whatsapp_connections
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = auth.uid()
        )
    );

-- Create separate policy for whatsapp_connections management (INSERT, UPDATE, DELETE)
CREATE POLICY "Agency admins can manage whatsapp connections" ON public.whatsapp_connections
    FOR ALL USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

-- Fix dashboard_widgets table - ensure no duplicate policies
DROP POLICY IF EXISTS "Agency members can view dashboard widgets" ON public.dashboard_widgets;
DROP POLICY IF EXISTS "Owners/Admins can manage dashboard widgets" ON public.dashboard_widgets;

-- Create single consolidated policy for dashboard_widgets SELECT
CREATE POLICY "Agency members can access dashboard widgets" ON public.dashboard_widgets
    FOR SELECT USING (
        dashboard_id IN (
            SELECT d.id FROM public.dashboards d
            JOIN public.team_members tm ON d.agency_id = tm.agency_id
            WHERE tm.id = auth.uid()
        )
    );

-- Create separate policy for dashboard_widgets management
CREATE POLICY "Agency owners/admins can manage dashboard widgets" ON public.dashboard_widgets
    FOR ALL USING (
        dashboard_id IN (
            SELECT d.id FROM public.dashboards d
            JOIN public.team_members tm ON d.agency_id = tm.agency_id
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        dashboard_id IN (
            SELECT d.id FROM public.dashboards d
            JOIN public.team_members tm ON d.agency_id = tm.agency_id
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

-- Fix integrations table - ensure no duplicate policies
DROP POLICY IF EXISTS "Agency members can view integrations" ON public.integrations;
DROP POLICY IF EXISTS "Agency admins can manage integrations" ON public.integrations;

-- Create single consolidated policy for integrations SELECT
CREATE POLICY "Agency members can access integrations" ON public.integrations
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = auth.uid()
        )
    );

-- Create separate policy for integrations management
CREATE POLICY "Agency admins can manage integrations" ON public.integrations
    FOR ALL USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

COMMIT;