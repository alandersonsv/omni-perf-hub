-- Correção de metadados inconsistentes
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(
    raw_user_meta_data, 
    '{agency_name}', 
    '"Agência Teste"'
)
WHERE email = 'arcanjo022@gmail.com';

-- Verificar correção
SELECT 
    email, 
    raw_user_meta_data->>'agency_name' as corrected_agency_name 
FROM auth.users 
WHERE email IN ('arcanjo022@gmail.com', 'alandersonverissimo@gmail.com');