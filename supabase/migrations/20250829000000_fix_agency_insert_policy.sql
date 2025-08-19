-- Fix missing INSERT policy for agencies table
-- This migration adds the missing INSERT policy that allows authenticated users to create agencies

-- Add INSERT policy for agencies table
DROP POLICY IF EXISTS "Users can insert agencies" ON public.agencies;
CREATE POLICY "Users can insert agencies" ON public.agencies
    FOR INSERT WITH CHECK (
        -- Allow any authenticated user to create an agency
        (select auth.uid()) IS NOT NULL
    );

-- Ensure the policy is working by testing it
-- This will help verify that the policy was created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'agencies' 
AND schemaname = 'public'
ORDER BY policyname;