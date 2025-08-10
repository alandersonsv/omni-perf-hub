-- MIGRATION v4: Fix RLS policy missing on public.google_ads_campaigns_kpi
ALTER TABLE public.google_ads_campaigns_kpi ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view KPI" ON public.google_ads_campaigns_kpi;
CREATE POLICY "Authenticated users can view KPI" ON public.google_ads_campaigns_kpi
FOR SELECT USING (true);
