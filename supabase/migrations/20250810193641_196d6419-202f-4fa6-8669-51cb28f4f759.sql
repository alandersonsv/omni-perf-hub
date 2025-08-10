-- MIGRATION v3: Harden function search_path per linter

-- update_modified_column: add fixed search_path
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$function$;

-- handle_new_user: keep SECURITY DEFINER and set empty search_path for safety
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$function$;

-- insert_google_ads_sync_log: add fixed search_path
CREATE OR REPLACE FUNCTION public.insert_google_ads_sync_log(
  p_total_customers integer,
  p_total_campaigns integer,
  p_campaigns_synced integer,
  p_sync_status text DEFAULT 'SUCCESS',
  p_error_message text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_log_id BIGINT;
BEGIN
    INSERT INTO public.google_ads_sync_log (
        total_customers, 
        total_campaigns, 
        campaigns_synced, 
        sync_status, 
        error_message,
        created_by
    ) VALUES (
        p_total_customers,
        p_total_campaigns,
        p_campaigns_synced,
        p_sync_status,
        p_error_message,
        auth.uid()
    ) RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$function$;