-- =====================================================
-- CONFIGURAÇÃO COMPLETA PARA USUÁRIO ALANDERSONVERISSIMO@GMAIL.COM
-- Garantir acesso direto ao dashboard após login
-- =====================================================

BEGIN;

-- 1. Verificar se o usuário existe
DO $$
DECLARE
    user_id UUID;
    agency_id UUID;
    existing_agency_id UUID;
BEGIN
    -- Buscar ID do usuário
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = 'alandersonverissimo@gmail.com';
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'Usuário alandersonverissimo@gmail.com não encontrado';
    END IF;
    
    RAISE NOTICE 'Usuário encontrado: %', user_id;
    
    -- Verificar se já tem agência
    SELECT tm.agency_id INTO existing_agency_id
    FROM team_members tm
    WHERE tm.id = user_id;
    
    IF existing_agency_id IS NOT NULL THEN
        RAISE NOTICE 'Usuário já possui agência: %', existing_agency_id;
        -- Atualizar metadados para garantir consistência
        UPDATE auth.users 
        SET raw_user_meta_data = jsonb_set(
            jsonb_set(
                COALESCE(raw_user_meta_data, '{}'),
                '{agency_id}',
                to_jsonb(existing_agency_id::text)
            ),
            '{agency_name}',
            to_jsonb((
                SELECT name FROM agencies WHERE id = existing_agency_id
            ))
        )
        WHERE id = user_id;
        
        RAISE NOTICE 'Metadados atualizados para usuário existente';
    ELSE
        -- Criar nova agência completa
        INSERT INTO agencies (
            name,
            email,
            phone,
            subscription_plan,
            trial_ends_at,
            created_at,
            updated_at
        ) VALUES (
            'Kin Lai Digital Agency',
            'alandersonverissimo@gmail.com',
            '+55 11 99999-9999',
            'trial',
            NOW() + INTERVAL '30 days',
            NOW(),
            NOW()
        ) RETURNING id INTO agency_id;
        
        RAISE NOTICE 'Nova agência criada: %', agency_id;
        
        -- Associar usuário à agência como owner
        INSERT INTO team_members (
            id,
            agency_id,
            email,
            role,
            accepted_at,
            created_at,
            updated_at
        ) VALUES (
            user_id,
            agency_id,
            'alandersonverissimo@gmail.com',
            'owner',
            NOW(),
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Usuário associado à agência como owner';
        
        -- Atualizar metadados do usuário
        UPDATE auth.users 
        SET raw_user_meta_data = jsonb_set(
            jsonb_set(
                jsonb_set(
                    COALESCE(raw_user_meta_data, '{}'),
                    '{agency_id}',
                    to_jsonb(agency_id::text)
                ),
                '{agency_name}',
                '"Kin Lai Digital Agency"'
            ),
            '{role}',
            '"owner"'
        )
        WHERE id = user_id;
        
        RAISE NOTICE 'Metadados do usuário atualizados';
        
        -- Criar alguns clientes de exemplo para a agência
        INSERT INTO agency_clients (
            agency_id,
            name,
            email,
            phone,
            status,
            created_at,
            updated_at
        ) VALUES 
        (
            agency_id,
            'Cliente Exemplo 1',
            'cliente1@exemplo.com',
            '+55 11 88888-8888',
            'active',
            NOW(),
            NOW()
        ),
        (
            agency_id,
            'Cliente Exemplo 2',
            'cliente2@exemplo.com',
            '+55 11 77777-7777',
            'active',
            NOW(),
            NOW()
        );
        
        RAISE NOTICE 'Clientes de exemplo criados';
    END IF;
END $$;

-- 2. Verificar configuração final
SELECT 
    'CONFIGURAÇÃO FINAL' as status,
    u.email,
    u.id as user_id,
    u.raw_user_meta_data->>'agency_name' as metadata_agency,
    u.raw_user_meta_data->>'agency_id' as metadata_agency_id,
    tm.agency_id,
    tm.role,
    a.name as agency_name,
    a.subscription_plan,
    (SELECT COUNT(*) FROM agency_clients WHERE agency_id = a.id) as client_count
FROM auth.users u
JOIN team_members tm ON u.id = tm.id
JOIN agencies a ON tm.agency_id = a.id
WHERE u.email = 'alandersonverissimo@gmail.com';

COMMIT;