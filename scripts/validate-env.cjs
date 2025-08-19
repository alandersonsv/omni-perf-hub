#!/usr/bin/env node

/**
 * Script de validação de variáveis de ambiente
 * Executa antes do build para garantir configuração correta
 */

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  error: (msg) => console.error(`${colors.red}❌ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  warning: (msg) => console.warn(`${colors.yellow}⚠️ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️ ${msg}${colors.reset}`)
};

// Variáveis obrigatórias
const requiredVars = [
  {
    name: 'VITE_SUPABASE_URL',
    description: 'URL do projeto Supabase',
    validate: (value) => {
      if (!value) return 'Variável não definida';
      if (value.includes('your-project')) return 'Contém placeholder "your-project"';
      if (value.includes('localhost') && process.env.NODE_ENV === 'production') {
        return 'URL localhost em ambiente de produção';
      }
      if (!value.startsWith('http')) return 'URL deve começar com http/https';
      return null; // válida
    }
  },
  {
    name: 'VITE_SUPABASE_ANON_KEY',
    description: 'Chave anônima do Supabase',
    validate: (value) => {
      if (!value) return 'Variável não definida';
      if (value.includes('your_actual')) return 'Contém placeholder "your_actual"';
      if (value.length < 50) return 'Chave muito curta (deve ter pelo menos 50 caracteres)';
      if (!value.startsWith('eyJ')) return 'Formato de JWT inválido';
      return null; // válida
    }
  }
];

// Variáveis opcionais
const optionalVars = [
  {
    name: 'VITE_GOOGLE_CLIENT_ID',
    description: 'ID do cliente Google OAuth'
  },
  {
    name: 'VITE_META_APP_ID',
    description: 'ID do app Meta/Facebook'
  },
  {
    name: 'VITE_OAUTH_STATE_SECRET',
    description: 'Segredo para proteção CSRF do OAuth'
  }
];

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    log.warning('Arquivo .env não encontrado');
    return {};
  }
  
  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key] = valueParts.join('=');
        }
      }
    });
    
    return envVars;
  } catch (error) {
    log.error(`Erro ao ler arquivo .env: ${error.message}`);
    return {};
  }
}

function validateEnvironment() {
  log.info('Iniciando validação de variáveis de ambiente...');
  log.info(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
  log.info(`Timestamp: ${new Date().toISOString()}`);
  
  const envFile = loadEnvFile();
  const errors = [];
  const warnings = [];
  
  // Validar variáveis obrigatórias
  log.info('\n📋 Validando variáveis obrigatórias:');
  
  requiredVars.forEach(varConfig => {
    const value = process.env[varConfig.name] || envFile[varConfig.name];
    const validation = varConfig.validate(value);
    
    if (validation) {
      errors.push(`${varConfig.name}: ${validation}`);
      log.error(`${varConfig.name}: ${validation}`);
    } else {
      log.success(`${varConfig.name}: OK`);
    }
  });
  
  // Verificar variáveis opcionais
  log.info('\n📋 Verificando variáveis opcionais:');
  
  optionalVars.forEach(varConfig => {
    const value = process.env[varConfig.name] || envFile[varConfig.name];
    
    if (value) {
      if (value.includes('your_actual') || value.includes('placeholder')) {
        warnings.push(`${varConfig.name}: Contém placeholder`);
        log.warning(`${varConfig.name}: Contém placeholder`);
      } else {
        log.success(`${varConfig.name}: Configurada`);
      }
    } else {
      log.warning(`${varConfig.name}: Não configurada (opcional)`);
    }
  });
  
  // Verificações específicas para produção
  if (process.env.NODE_ENV === 'production') {
    log.info('\n🏭 Verificações específicas de produção:');
    
    const supabaseUrl = process.env.VITE_SUPABASE_URL || envFile.VITE_SUPABASE_URL;
    if (supabaseUrl && supabaseUrl.includes('localhost')) {
      errors.push('VITE_SUPABASE_URL não deve apontar para localhost em produção');
      log.error('VITE_SUPABASE_URL não deve apontar para localhost em produção');
    }
    
    // Verificar se todas as variáveis OAuth estão configuradas para produção
    const oauthVars = ['VITE_GOOGLE_CLIENT_ID', 'VITE_META_APP_ID'];
    const missingOAuth = oauthVars.filter(varName => {
      const value = process.env[varName] || envFile[varName];
      return !value || value.includes('your_actual');
    });
    
    if (missingOAuth.length > 0) {
      warnings.push(`Variáveis OAuth não configuradas: ${missingOAuth.join(', ')}`);
      log.warning(`Variáveis OAuth não configuradas: ${missingOAuth.join(', ')}`);
    }
  }
  
  // Relatório final
  log.info('\n📊 Relatório de validação:');
  
  if (errors.length > 0) {
    log.error(`${errors.length} erro(s) encontrado(s):`);
    errors.forEach(error => log.error(`  - ${error}`));
  }
  
  if (warnings.length > 0) {
    log.warning(`${warnings.length} aviso(s):`);
    warnings.forEach(warning => log.warning(`  - ${warning}`));
  }
  
  if (errors.length === 0) {
    log.success('Todas as variáveis obrigatórias estão configuradas corretamente!');
    
    if (warnings.length === 0) {
      log.success('Configuração perfeita! ✨');
    } else {
      log.info('Build pode prosseguir, mas considere resolver os avisos.');
    }
    
    return true;
  } else {
    log.error('\n🚫 Build cancelado devido a erros de configuração.');
    log.info('\n💡 Para corrigir:');
    log.info('1. Configure as variáveis de ambiente no seu serviço de deploy');
    log.info('2. Ou atualize o arquivo .env com valores reais');
    log.info('3. Execute novamente o build');
    
    return false;
  }
}

function generateEnvTemplate() {
  const templatePath = path.join(process.cwd(), '.env.example');
  
  let template = '# Exemplo de configuração de variáveis de ambiente\n';
  template += '# Copie este arquivo para .env e configure com valores reais\n\n';
  
  template += '# Supabase (OBRIGATÓRIO)\n';
  requiredVars.forEach(varConfig => {
    template += `${varConfig.name}=# ${varConfig.description}\n`;
  });
  
  template += '\n# OAuth (OPCIONAL)\n';
  optionalVars.forEach(varConfig => {
    template += `${varConfig.name}=# ${varConfig.description}\n`;
  });
  
  fs.writeFileSync(templatePath, template);
  log.success(`Template criado em ${templatePath}`);
}

// Executar validação
if (require.main === module) {
  const isValid = validateEnvironment();
  
  // Gerar template se solicitado
  if (process.argv.includes('--generate-template')) {
    generateEnvTemplate();
  }
  
  // Sair com código de erro se validação falhou
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateEnvironment, generateEnvTemplate };