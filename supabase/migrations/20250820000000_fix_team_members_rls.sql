-- Fix infinite recursion in team_members RLS policies
-- The issue is that policies are referencing team_members table within themselves

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
DROP POLICY IF EXISTS "Agency owners/admins can manage team" ON public.team_members;

-- Create corrected policies that don't cause recursion
-- Use auth.uid() directly instead of querying team_members table
CREATE POLICY "Agency members can view team" ON public.team_members
    FOR SELECT USING (
        -- Allow if user is authenticated and belongs to the same agency
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.raw_user_meta_data->>'agency_id' = team_members.agency_id::text
        )
    );

CREATE POLICY "Agency owners/admins can manage team" ON public.team_members
    FOR ALL USING (
        -- Allow if user is authenticated and is owner/admin of the same agency
        auth.uid() IS NOT NULL AND 
        EXISTS (
            SELECT 1 FROM auth.users u 
            WHERE u.id = auth.uid() 
            AND u.raw_user_meta_data->>'agency_id' = team_members.agency_id::text
            AND u.raw_user_meta_data->>'role' IN ('owner', 'admin')
        )
    );

-- Alternative approach: Create a function to check team membership
-- This avoids recursion by using a different approach
CREATE OR REPLACE FUNCTION public.is_agency_member(agency_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user belongs to the agency via auth.users metadata
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'agency_id' = agency_uuid::text
    );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_agency_admin(agency_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if current user is admin/owner of the agency
    RETURN EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND raw_user_meta_data->>'agency_id' = agency_uuid::text
        AND raw_user_meta_data->>'role' IN ('owner', 'admin')
    );
END;
$$;

-- Drop and recreate policies using the helper functions
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
DROP POLICY IF EXISTS "Agency owners/admins can manage team" ON public.team_members;

CREATE POLICY "Agency members can view team" ON public.team_members
    FOR SELECT USING (public.is_agency_member(agency_id));

CREATE POLICY "Agency owners/admins can manage team" ON public.team_members
    FOR ALL USING (public.is_agency_admin(agency_id));