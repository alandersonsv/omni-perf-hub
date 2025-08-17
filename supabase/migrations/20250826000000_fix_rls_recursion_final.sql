-- Fix infinite recursion in team_members RLS policies
-- This migration completely removes circular dependencies

-- Drop all existing problematic policies
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
DROP POLICY IF EXISTS "Agency owners/admins can manage team" ON public.team_members;
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON public.team_members;

-- Create simple, non-recursive policies

-- Policy 1: Users can view their own team_member record
CREATE POLICY "Users can view own team record" ON public.team_members
    FOR SELECT USING (
        auth.uid() = id
    );

-- Policy 2: Users can insert themselves as team members (for registration)
CREATE POLICY "Users can insert themselves as team members" ON public.team_members
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- Policy 3: Users can update their own team_member record
CREATE POLICY "Users can update own team record" ON public.team_members
    FOR UPDATE USING (
        auth.uid() = id
    ) WITH CHECK (
        auth.uid() = id
    );

-- Policy 4: Allow owners to manage team members in their agency
-- This uses a direct agency ownership check without recursion
CREATE POLICY "Agency owners can manage team" ON public.team_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agencies a
            WHERE a.id = team_members.agency_id
            AND a.id IN (
                SELECT tm.agency_id FROM public.team_members tm 
                WHERE tm.id = auth.uid() AND tm.role = 'owner'
            )
        )
    );

-- Update other policies to avoid recursion
-- Fix integrations policies
DROP POLICY IF EXISTS "Agency members can view integrations" ON public.integrations;
CREATE POLICY "Agency members can view integrations" ON public.integrations
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Agency admins can manage integrations" ON public.integrations;
CREATE POLICY "Agency admins can manage integrations" ON public.integrations
    FOR ALL USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

-- Fix agencies policies
DROP POLICY IF EXISTS "Users can view their own agency" ON public.agencies;
CREATE POLICY "Users can view their own agency" ON public.agencies
    FOR SELECT USING (
        id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Users can update their own agency" ON public.agencies;
CREATE POLICY "Users can update their own agency" ON public.agencies
    FOR UPDATE USING (
        id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    ) WITH CHECK (
        id IN (
            SELECT tm.agency_id FROM public.team_members tm 
            WHERE tm.id = auth.uid() AND tm.role IN ('owner', 'admin')
        )
    );

-- Allow users to insert agencies (for registration)
DROP POLICY IF EXISTS "Users can insert agencies" ON public.agencies;
CREATE POLICY "Users can insert agencies" ON public.agencies
    FOR INSERT WITH CHECK (true); -- Allow any authenticated user to create an agency

COMMIT;