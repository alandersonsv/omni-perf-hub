-- =====================================================
-- CORREÇÃO CRÍTICA DAS POLÍTICAS RLS
-- Eliminar recursão infinita em team_members
-- =====================================================

BEGIN;

-- Desabilitar RLS temporariamente para evitar bloqueios
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas problemáticas de team_members
DROP POLICY IF EXISTS "Agency owners can manage team" ON team_members;
DROP POLICY IF EXISTS "Users can insert themselves as team members" ON team_members;
DROP POLICY IF EXISTS "Users can update own team record" ON team_members;
DROP POLICY IF EXISTS "Users can view own team record" ON team_members;

-- Criar políticas otimizadas SEM RECURSÃO

-- 1. Política para leitura própria (sem recursão)
CREATE POLICY "tm_read_own" ON team_members
    FOR SELECT
    USING (id = (SELECT auth.uid()));

-- 2. Política para inserção própria (auto-associação)
CREATE POLICY "tm_insert_self" ON team_members
    FOR INSERT
    WITH CHECK (
        id = (SELECT auth.uid())
        AND email = (SELECT auth.email())
    );

-- 3. Política para atualização própria
CREATE POLICY "tm_update_own" ON team_members
    FOR UPDATE
    USING (id = (SELECT auth.uid()))
    WITH CHECK (id = (SELECT auth.uid()));

-- Reabilitar RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Verificar se as políticas foram criadas corretamente
SELECT 
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'team_members' 
AND schemaname = 'public'
ORDER BY policyname;

COMMIT;