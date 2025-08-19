-- Fix team_members table duplicates and improve query reliability
-- This migration addresses the 406 error caused by multiple rows for the same user

-- First, let's check for duplicates
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT id, COUNT(*) as cnt
        FROM public.team_members
        GROUP BY id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE 'Found % users with duplicate team_members records', duplicate_count;
    
    -- If duplicates exist, clean them up
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Cleaning up duplicate team_members records...';
        
        -- Keep only the most recent record for each user
        DELETE FROM public.team_members
        WHERE ctid NOT IN (
            SELECT DISTINCT ON (id) ctid
            FROM public.team_members
            ORDER BY id, created_at DESC NULLS LAST, ctid
        );
        
        RAISE NOTICE 'Duplicate cleanup completed';
    END IF;
END $$;

-- Add unique constraint to prevent future duplicates
DROP INDEX IF EXISTS idx_team_members_unique_user;
CREATE UNIQUE INDEX idx_team_members_unique_user ON public.team_members(id);

-- Improve the team_members policies to handle edge cases better
DROP POLICY IF EXISTS "Users can view own team record" ON public.team_members;
CREATE POLICY "Users can view own team record" ON public.team_members
    FOR SELECT USING (
        (select auth.uid()) = id
    );

-- Add a policy for viewing team members in the same agency (for admin purposes)
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
CREATE POLICY "Agency members can view team" ON public.team_members
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = (select auth.uid())
        )
    );

-- Verify the fix by checking for remaining duplicates
DO $$
DECLARE
    remaining_duplicates INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_duplicates
    FROM (
        SELECT id, COUNT(*) as cnt
        FROM public.team_members
        GROUP BY id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF remaining_duplicates = 0 THEN
        RAISE NOTICE 'SUCCESS: No duplicate team_members records found';
    ELSE
        RAISE WARNING 'WARNING: % duplicate records still exist', remaining_duplicates;
    END IF;
END $$;

-- Show current team_members for debugging
SELECT 
    id,
    email,
    agency_id,
    role,
    'team_member_record' as record_type
FROM public.team_members
WHERE id = 'ce1296e8-8701-48a9-8b6d-c3530a0c7465';
-- Fix team_members table duplicates and improve query reliability
-- This migration addresses the 406 error caused by multiple rows for the same user

-- First, let's check for duplicates
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Count duplicates
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT id, COUNT(*) as cnt
        FROM public.team_members
        GROUP BY id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE 'Found % users with duplicate team_members records', duplicate_count;
    
    -- If duplicates exist, clean them up
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Cleaning up duplicate team_members records...';
        
        -- Keep only the most recent record for each user
        DELETE FROM public.team_members
        WHERE ctid NOT IN (
            SELECT DISTINCT ON (id) ctid
            FROM public.team_members
            ORDER BY id, created_at DESC NULLS LAST, ctid
        );
        
        RAISE NOTICE 'Duplicate cleanup completed';
    END IF;
END $$;

-- Add unique constraint to prevent future duplicates
DROP INDEX IF EXISTS idx_team_members_unique_user;
CREATE UNIQUE INDEX idx_team_members_unique_user ON public.team_members(id);

-- Improve the team_members policies to handle edge cases better
DROP POLICY IF EXISTS "Users can view own team record" ON public.team_members;
CREATE POLICY "Users can view own team record" ON public.team_members
    FOR SELECT USING (
        (select auth.uid()) = id
    );

-- Add a policy for viewing team members in the same agency (for admin purposes)
DROP POLICY IF EXISTS "Agency members can view team" ON public.team_members;
CREATE POLICY "Agency members can view team" ON public.team_members
    FOR SELECT USING (
        agency_id IN (
            SELECT tm.agency_id FROM public.team_members tm WHERE tm.id = (select auth.uid())
        )
    );

-- Verify the fix by checking for remaining duplicates
DO $$
DECLARE
    remaining_duplicates INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_duplicates
    FROM (
        SELECT id, COUNT(*) as cnt
        FROM public.team_members
        GROUP BY id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF remaining_duplicates = 0 THEN
        RAISE NOTICE 'SUCCESS: No duplicate team_members records found';
    ELSE
        RAISE WARNING 'WARNING: % duplicate records still exist', remaining_duplicates;
    END IF;
END $$;

-- Show current team_members for debugging
SELECT 
    id,
    email,
    agency_id,
    role,
    created_at,
    'team_member_record' as record_type
FROM public.team_members
WHERE id = 'ce1296e8-8701-48a9-8b6d-c3530a0c7465'
ORDER BY created_at DESC;