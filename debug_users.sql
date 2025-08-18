-- Script para debug de usuários e autenticação

-- 1. Verificar usuários existentes
SELECT 
    id,
    email,
    created_at,
    last_sign_in_at,
    email_confirmed_at,
    raw_user_meta_data
FROM auth.users
ORDER BY created_at DESC;

-- 2. Verificar team_members
SELECT 
    tm.id,
    tm.email,
    tm.role,
    tm.agency_id,
    a.name as agency_name
FROM team_members tm
LEFT JOIN agencies a ON tm.agency_id = a.id;

-- 3. Verificar agencies
SELECT 
    id,
    name,
    email,
    created_at
FROM agencies
ORDER BY created_at DESC;

-- 4. Criar usuário de teste se não existir
DO $$
BEGIN
    -- Verificar se o usuário já existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com') THEN
        -- Inserir usuário de teste
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            is_super_admin
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'test@example.com',
            crypt('password123', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW(),
            '{"full_name": "Test User"}',
            false
        );
        
        RAISE NOTICE 'Usuário de teste criado: test@example.com / password123';
    ELSE
        RAISE NOTICE 'Usuário de teste já existe: test@example.com';
    END IF;
END $$;

-- 5. Verificar se o usuário alandersonverissimo@gmail.com existe
SELECT 
    'User Check' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'alandersonverissimo@gmail.com') 
        THEN 'EXISTS' 
        ELSE 'NOT_FOUND' 
    END as status,
    'alandersonverissimo@gmail.com' as email;

-- 6. Verificar configuração de auth
SELECT 
    'Auth Config' as check_type,
    current_setting('app.jwt_secret', true) as jwt_secret_set,
    current_setting('app.jwt_exp', true) as jwt_exp;

-- 7. Verificar políticas RLS ativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('team_members', 'agencies')
ORDER BY tablename, policyname;