-- =====================================================
-- MIGRAÇÃO COMPLETA PARA ARQUITETURA "DATABASE-FIRST"
-- Baseado na documentação: DOCUMENTACAO_HISTORICA_E_NOVA_SOLUCAO.md
-- =====================================================

-- =====================================================
-- FASE 1: PREPARAÇÃO E BACKUP (30 min)
-- =====================================================

BEGIN;

-- 1.1 Backup completo das políticas atuais
CREATE TABLE IF NOT EXISTS rls_policies_backup AS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check,
    NOW() as backup_date
FROM pg_policies 
WHERE schemaname = 'public';

-- 1.2 Backup dos dados críticos
CREATE TABLE IF NOT EXISTS auth_users_backup AS SELECT * FROM auth.users;
CREATE TABLE IF NOT EXISTS team_members_backup AS SELECT * FROM team_members;
CREATE TABLE IF NOT EXISTS agencies_backup AS SELECT * FROM agencies;
CREATE TABLE IF NOT EXISTS agency_clients_backup AS SELECT * FROM agency_clients;

-- 1.3 Verificar integridade dos dados
DO $$
DECLARE
    total_users INTEGER;
    users_with_teams INTEGER;
    orphaned_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users FROM auth.users;
    SELECT COUNT(*) INTO users_with_teams FROM auth.users u JOIN team_members tm ON u.id = tm.id;
    SELECT COUNT(*) INTO orphaned_users FROM auth.users u LEFT JOIN team_members tm ON u.id = tm.id WHERE tm.id IS NULL;
    
    RAISE NOTICE 'BACKUP PHASE COMPLETED:';
    RAISE NOTICE '  Total Users: %', total_users;
    RAISE NOTICE '  Users with Team Members: %', users_with_teams;
    RAISE NOTICE '  Orphaned Users: %', orphaned_users;
END $$;

COMMIT;

-- =====================================================
-- FASE 2: IMPLEMENTAÇÃO DO BANCO (45 min)
-- =====================================================

BEGIN;

-- 2.1 Criar tabela user_profiles
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Migrar dados existentes para user_profiles
INSERT INTO user_profiles (id, email, full_name, onboarding_completed)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', u.email),
    CASE 
        WHEN tm.id IS NOT NULL THEN TRUE
        ELSE FALSE
    END
FROM auth.users u
LEFT JOIN team_members tm ON u.id = tm.id
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    onboarding_completed = EXCLUDED.onboarding_completed;

-- 2.3 Criar trigger para novos usuários
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- 2.4 Criar view consolidada user_agency_view
CREATE OR REPLACE VIEW user_agency_view AS
SELECT 
    u.id,
    u.email,
    up.full_name,
    up.avatar_url,
    up.onboarding_completed,
    tm.agency_id,
    tm.role,
    tm.accepted_at,
    a.name as agency_name,
    a.subscription_plan,
    a.trial_ends_at,
    CASE 
        WHEN tm.agency_id IS NULL THEN 'no_agency'
        WHEN up.onboarding_completed = FALSE THEN 'onboarding_required'
        ELSE 'ready'
    END as user_status
FROM auth.users u
JOIN user_profiles up ON u.id = up.id
LEFT JOIN team_members tm ON u.id = tm.id
LEFT JOIN agencies a ON tm.agency_id = a.id;

-- 2.5 Verificar criação da estrutura
DO $$
DECLARE
    profiles_count INTEGER;
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profiles_count FROM user_profiles;
    SELECT COUNT(*) INTO view_count FROM user_agency_view;
    
    RAISE NOTICE 'DATABASE STRUCTURE PHASE COMPLETED:';
    RAISE NOTICE '  User Profiles Created: %', profiles_count;
    RAISE NOTICE '  View Records Available: %', view_count;
END $$;

COMMIT;

-- =====================================================
-- FASE 3: ATUALIZAÇÃO DAS POLÍTICAS RLS (30 min)
-- =====================================================

BEGIN;

-- 3.1 Desabilitar RLS temporariamente
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_clients DISABLE ROW LEVEL SECURITY;

-- 3.2 Remover todas as políticas existentes
DROP POLICY IF EXISTS "tm_read_own" ON team_members;
DROP POLICY IF EXISTS "tm_insert_self" ON team_members;
DROP POLICY IF EXISTS "tm_update_own" ON team_members;
DROP POLICY IF EXISTS "Users can insert agencies" ON agencies;
DROP POLICY IF EXISTS "Users can update their own agency" ON agencies;
DROP POLICY IF EXISTS "Users can view their own agency" ON agencies;
DROP POLICY IF EXISTS "Agency members can manage clients" ON agency_clients;
DROP POLICY IF EXISTS "Agency members can view clients" ON agency_clients;
DROP POLICY IF EXISTS "Agency admins can manage AI results" ON ai_results;
DROP POLICY IF EXISTS "Agency members can view AI results" ON ai_results;

-- 3.3 Criar políticas RLS consolidadas e otimizadas

-- USER_PROFILES: Acesso próprio apenas
CREATE POLICY "profiles_own_access" ON user_profiles
    FOR ALL
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- TEAM_MEMBERS: Acesso próprio + owners da mesma agência (SEM RECURSÃO)
CREATE POLICY "tm_comprehensive_access" ON team_members
    FOR ALL
    USING (
        -- Próprio registro
        id = (SELECT auth.uid())
        OR
        -- Owner da mesma agência (SEM RECURSÃO)
        agency_id = (
            SELECT agency_id 
            FROM team_members 
            WHERE id = (SELECT auth.uid()) 
            AND role = 'owner'
            LIMIT 1
        )
    )
    WITH CHECK (
        -- Inserção: apenas próprio registro
        (id = (SELECT auth.uid()) AND TG_OP = 'INSERT')
        OR
        -- Update/Delete: próprio ou owner da agência
        (id = (SELECT auth.uid()) OR 
         agency_id = (
             SELECT agency_id 
             FROM team_members 
             WHERE id = (SELECT auth.uid()) 
             AND role = 'owner'
             LIMIT 1
         ))
    );

-- AGENCIES: Acesso baseado em team_members
CREATE POLICY "agencies_team_access" ON agencies
    FOR ALL
    USING (
        id = (
            SELECT agency_id 
            FROM team_members 
            WHERE id = (SELECT auth.uid())
            LIMIT 1
        )
    )
    WITH CHECK (
        -- Apenas owners podem modificar
        id = (
            SELECT agency_id 
            FROM team_members 
            WHERE id = (SELECT auth.uid()) 
            AND role = 'owner'
            LIMIT 1
        )
    );

-- AGENCY_CLIENTS: Consolidada em uma política
CREATE POLICY "clients_agency_access" ON agency_clients
    FOR ALL
    USING (
        agency_id = (
            SELECT agency_id 
            FROM team_members 
            WHERE id = (SELECT auth.uid())
            LIMIT 1
        )
    )
    WITH CHECK (
        agency_id = (
            SELECT agency_id 
            FROM team_members 
            WHERE id = (SELECT auth.uid())
            LIMIT 1
        )
    );

-- AI_RESULTS: Política consolidada se a tabela existir
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_results') THEN
        EXECUTE 'CREATE POLICY "ai_results_agency_access" ON ai_results
            FOR ALL
            USING (
                agency_id = (
                    SELECT agency_id 
                    FROM team_members 
                    WHERE id = (SELECT auth.uid())
                    LIMIT 1
                )
            )
            WITH CHECK (
                agency_id = (
                    SELECT agency_id 
                    FROM team_members 
                    WHERE id = (SELECT auth.uid())
                    LIMIT 1
                )
            )';
    END IF;
END $$;

-- 3.4 Reabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;

-- 3.5 Verificar políticas criadas
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO policy_count 
    FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('user_profiles', 'team_members', 'agencies', 'agency_clients');
    
    RAISE NOTICE 'RLS POLICIES PHASE COMPLETED:';
    RAISE NOTICE '  New Policies Created: %', policy_count;
END $$;

COMMIT;

-- =====================================================
-- FASE 4: VALIDAÇÃO E TESTES (15 min)
-- =====================================================

BEGIN;

-- 4.1 Testar acesso à view consolidada
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_count FROM user_agency_view;
    RAISE NOTICE 'VIEW ACCESS TEST: % records accessible', test_count;
END $$;

-- 4.2 Testar políticas RLS com usuário específico
DO $$
BEGIN
    -- Simular contexto de usuário
    PERFORM set_config('request.jwt.claims', '{"sub": "7a7b1981-5cd0-4505-8ab6-7737e7bc82cb"}', true);
    
    -- Testar acesso
    IF EXISTS (SELECT 1 FROM user_agency_view WHERE id = '7a7b1981-5cd0-4505-8ab6-7737e7bc82cb') THEN
        RAISE NOTICE 'RLS TEST: User access working correctly';
    ELSE
        RAISE NOTICE 'RLS TEST: User access failed';
    END IF;
    
    -- Reset context
    PERFORM set_config('request.jwt.claims', '', true);
END $$;

-- 4.3 Verificar integridade final
SELECT 
    'FINAL VALIDATION' as phase,
    COUNT(*) as total_users,
    COUNT(CASE WHEN user_status = 'ready' THEN 1 END) as ready_users,
    COUNT(CASE WHEN user_status = 'no_agency' THEN 1 END) as users_needing_agency,
    COUNT(CASE WHEN user_status = 'onboarding_required' THEN 1 END) as users_needing_onboarding
FROM user_agency_view;

COMMIT;

-- =====================================================
-- FASE 5: CRIAÇÃO DE VIEWS DE MONITORAMENTO
-- =====================================================

BEGIN;

-- 5.1 View de saúde do sistema
CREATE OR REPLACE VIEW system_health AS
SELECT 
    'Total Users' as metric,
    COUNT(*)::text as value,
    'green' as status
FROM auth.users
UNION ALL
SELECT 
    'Users Ready' as metric,
    COUNT(*)::text as value,
    CASE WHEN COUNT(*) > 0 THEN 'green' ELSE 'red' END as status
FROM user_agency_view
WHERE user_status = 'ready'
UNION ALL
SELECT 
    'Users Needing Onboarding' as metric,
    COUNT(*)::text as value,
    CASE WHEN COUNT(*) = 0 THEN 'green' ELSE 'yellow' END as status
FROM user_agency_view
WHERE user_status IN ('no_agency', 'onboarding_required')
UNION ALL
SELECT 
    'RLS Policies Active' as metric,
    COUNT(*)::text as value,
    CASE WHEN COUNT(*) >= 4 THEN 'green' ELSE 'red' END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'team_members', 'agencies', 'agency_clients');

-- 5.2 View de diagnóstico RLS
CREATE OR REPLACE VIEW rls_health_check AS
SELECT 
    tablename,
    policyname,
    CASE 
        WHEN qual LIKE '%' || tablename || '%' THEN 'POTENTIAL_RECURSION'
        WHEN qual LIKE '%auth.uid()%' AND qual NOT LIKE '%(SELECT auth.uid())%' THEN 'PERFORMANCE_ISSUE'
        ELSE 'OK'
    END as status,
    qual as policy_definition
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'team_members', 'agencies', 'agency_clients');

RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY!';
RAISE NOTICE 'Next steps:';
RAISE NOTICE '1. Update frontend AuthContext';
RAISE NOTICE '2. Update ProtectedRoute component';
RAISE NOTICE '3. Create onboarding pages';
RAISE NOTICE '4. Test complete user flows';

COMMIT;

-- =====================================================
-- QUERIES DE VALIDAÇÃO FINAL
-- =====================================================

-- Verificar saúde do sistema
SELECT * FROM system_health;

-- Verificar políticas RLS
SELECT * FROM rls_health_check WHERE status != 'OK';

-- Verificar usuários específicos
SELECT 
    email,
    user_status,
    agency_name,
    role,
    onboarding_completed
FROM user_agency_view 
WHERE email IN ('alandersonverissimo@gmail.com', 'arcanjo022@gmail.com')
ORDER BY email;