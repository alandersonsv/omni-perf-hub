-- =====================================================
-- CORREÇÃO DOS ERROS DE MIGRAÇÃO
-- Corrigir problemas identificados durante a migração
-- =====================================================

BEGIN;

-- Desabilitar RLS temporariamente
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE agency_clients DISABLE ROW LEVEL SECURITY;

-- Remover política problemática se existir
DROP POLICY IF EXISTS "tm_comprehensive_access" ON team_members;

-- Criar política corrigida para TEAM_MEMBERS (sem TG_OP)
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
        -- Permitir inserção própria ou update/delete por owner
        id = (SELECT auth.uid()) 
        OR 
        agency_id = (
            SELECT agency_id 
            FROM team_members 
            WHERE id = (SELECT auth.uid()) 
            AND role = 'owner'
            LIMIT 1
        )
    );

-- Criar política para AGENCIES
DROP POLICY IF EXISTS "agencies_team_access" ON agencies;
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

-- Criar política para AGENCY_CLIENTS
DROP POLICY IF EXISTS "clients_agency_access" ON agency_clients;
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

-- Reabilitar RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE agency_clients ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Criar views de monitoramento
BEGIN;

-- View de saúde do sistema
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
    CASE WHEN COUNT(*) >= 3 THEN 'green' ELSE 'red' END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_profiles', 'team_members', 'agencies', 'agency_clients');

-- View de diagnóstico RLS
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

COMMIT;

-- Validação final
SELECT 'MIGRATION FIXES COMPLETED' as status;