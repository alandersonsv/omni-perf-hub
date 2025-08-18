# 🔐 GUIA COMPLETO: INTEGRAÇÃO GOOGLE ADS OAUTH
## Configuração para Aplicativo em Produção

---

## 🚨 **ANÁLISE DO ERRO ATUAL**

### **Erro Identificado:**
```
Erro ao iniciar conexão OAuth: Error: Serviço do Google temporariamente indisponível. 
Tente novamente em alguns minutos.
```

### **Possíveis Causas:**
1. **Credenciais de Desenvolvimento:** Usando Client ID de teste/placeholder
2. **Domínio Não Autorizado:** URL de produção não configurada no Google Console
3. **Escopo Não Aprovado:** Google Ads API requer aprovação específica
4. **Rate Limiting:** Muitas tentativas de conexão
5. **Configuração Incompleta:** OAuth consent screen não configurado adequadamente

---

## 🛠️ **CONFIGURAÇÕES GOOGLE CONSOLE**

### **1. Criar/Configurar Projeto Google Cloud**

#### **Passo 1: Acessar Google Cloud Console**
```
1. Acesse: https://console.cloud.google.com/
2. Selecione ou crie um projeto
3. Anote o Project ID
```

#### **Passo 2: Ativar APIs Necessárias**
```
APIs para ativar:
✅ Google Ads API
✅ Google Analytics Reporting API
✅ Google Analytics Data API
✅ Search Console API
✅ Google OAuth2 API
```

**Comando para ativar via CLI:**
```bash
gcloud services enable googleads.googleapis.com
gcloud services enable analyticsreporting.googleapis.com
gcloud services enable analyticsdata.googleapis.com
gcloud services enable searchconsole.googleapis.com
gcloud services enable oauth2.googleapis.com
```

### **2. Configurar OAuth Consent Screen**

#### **Informações Obrigatórias:**
```
Tipo de Aplicação: External
Nome do App: Metrionix
Email de Suporte: alandersonverissimo@gmail.com
Logo: Upload do logo da Metrionix
Domínio da Aplicação: metrionix.netlify.app
Domínios Autorizados: 
  - metrionix.netlify.app
  - localhost (para desenvolvimento)
```

#### **Escopos a Solicitar:**
```
Escopos Obrigatórios:
✅ https://www.googleapis.com/auth/adwords
✅ https://www.googleapis.com/auth/analytics.readonly
✅ https://www.googleapis.com/auth/webmasters.readonly
✅ https://www.googleapis.com/auth/userinfo.email
✅ https://www.googleapis.com/auth/userinfo.profile
```

#### **Justificativa para Escopos (Texto para Google):**
```
METRIONIX - PLATAFORMA DE MARKETING DIGITAL

Descrição: Metrionix é uma plataforma SaaS B2B que oferece dashboards 
unificados para agências de marketing digital gerenciarem campanhas de 
múltiplos clientes.

Uso do OAuth: Integramos com Google Ads API, Analytics API e Search 
Console API para consolidar dados de campanhas publicitárias, métricas 
de tráfego e performance SEO em relatórios únicos.

Usuários: Agências de marketing, consultores e empresas que gerenciam 
campanhas digitais para clientes.

Credenciais de Teste:
- Email: alandersonverissimo@gmail.com
- Senha: TesteMetrionix2025!
- Conta demo com dados simulados disponível

URLs de Produção:
- App: https://metrionix.netlify.app
- Política: https://metrionix.netlify.app/legal/privacy-policy-2025-confidential
- Termos: https://metrionix.netlify.app/legal/terms-of-service-2025-confidential

Segurança: Implementamos OAuth 2.0, HTTPS, RLS no banco, criptografia 
de tokens e conformidade LGPD/GDPR.

Contato: alandersonverissimo@gmail.com
```

### **3. Criar Credenciais OAuth 2.0**

#### **Configuração do Client ID:**
```
Tipo: Web Application
Nome: Metrionix Production

JavaScript Origins Autorizadas:
- https://metrionix.netlify.app
- http://localhost:8081 (desenvolvimento)
- http://localhost:3000 (desenvolvimento)

Redirect URIs Autorizadas:
- https://metrionix.netlify.app/oauth/callback
- http://localhost:8081/oauth/callback
- http://localhost:3000/oauth/callback
```

---

## 💻 **ALTERAÇÕES NO CÓDIGO**

### **1. Atualizar Variáveis de Ambiente**

#### **Arquivo: `.env`**
```env
# Google OAuth - PRODUÇÃO
VITE_GOOGLE_CLIENT_ID=seu_client_id_real_aqui.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_aqui

# URLs de Callback
VITE_OAUTH_REDIRECT_URI=https://metrionix.netlify.app/oauth/callback
VITE_OAUTH_REDIRECT_URI_DEV=http://localhost:8081/oauth/callback

# Google Ads
VITE_GOOGLE_ADS_DEVELOPER_TOKEN=seu_developer_token_aqui
VITE_GOOGLE_ADS_CUSTOMER_ID=seu_customer_id_aqui

# Configurações de Ambiente
VITE_ENVIRONMENT=production
VITE_API_BASE_URL=https://metrionix.netlify.app
```

### **2. Melhorar Tratamento de Erros OAuth**

#### **Arquivo: `src/hooks/useOAuthFlow.ts`**
```typescript
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OAuthError {
  code: string;
  message: string;
  retryable: boolean;
  retryAfter?: number;
}

const OAUTH_ERRORS = {
  GOOGLE_UNAVAILABLE: {
    code: 'GOOGLE_UNAVAILABLE',
    message: 'Serviço do Google temporariamente indisponível. Tente novamente em alguns minutos.',
    retryable: true,
    retryAfter: 300000 // 5 minutos
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Credenciais OAuth inválidas. Verifique a configuração.',
    retryable: false
  },
  SCOPE_NOT_APPROVED: {
    code: 'SCOPE_NOT_APPROVED',
    message: 'Escopo não aprovado pelo Google. Aguarde aprovação da revisão.',
    retryable: false
  },
  RATE_LIMITED: {
    code: 'RATE_LIMITED',
    message: 'Muitas tentativas. Aguarde antes de tentar novamente.',
    retryable: true,
    retryAfter: 60000 // 1 minuto
  }
};

export const useOAuthFlow = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<OAuthError | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const getRedirectUri = () => {
    const isDev = import.meta.env.DEV;
    return isDev 
      ? import.meta.env.VITE_OAUTH_REDIRECT_URI_DEV 
      : import.meta.env.VITE_OAUTH_REDIRECT_URI;
  };

  const validateEnvironment = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId || clientId.includes('placeholder') || clientId.includes('demo')) {
      throw new Error('INVALID_CREDENTIALS');
    }
    
    if (!getRedirectUri()) {
      throw new Error('INVALID_CONFIGURATION');
    }
  };

  const handleOAuthError = (error: any): OAuthError => {
    console.error('OAuth Error:', error);
    
    // Analisar tipo de erro
    if (error.message?.includes('temporarily unavailable') || 
        error.message?.includes('temporariamente indisponível')) {
      return OAUTH_ERRORS.GOOGLE_UNAVAILABLE;
    }
    
    if (error.message?.includes('invalid_client') || 
        error.message?.includes('unauthorized_client')) {
      return OAUTH_ERRORS.INVALID_CREDENTIALS;
    }
    
    if (error.message?.includes('access_denied') || 
        error.message?.includes('scope')) {
      return OAUTH_ERRORS.SCOPE_NOT_APPROVED;
    }
    
    if (error.message?.includes('rate') || 
        error.message?.includes('quota')) {
      return OAUTH_ERRORS.RATE_LIMITED;
    }
    
    // Erro genérico
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'Erro desconhecido durante autenticação OAuth',
      retryable: true,
      retryAfter: 30000
    };
  };

  const initiateGoogleAdsConnection = useCallback(async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      // Validar ambiente
      validateEnvironment();
      
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      const redirectUri = getRedirectUri();
      
      // Escopos necessários para Google Ads
      const scopes = [
        'https://www.googleapis.com/auth/adwords',
        'https://www.googleapis.com/auth/analytics.readonly',
        'https://www.googleapis.com/auth/webmasters.readonly',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' ');
      
      // Gerar state para segurança
      const state = btoa(JSON.stringify({
        timestamp: Date.now(),
        nonce: Math.random().toString(36).substring(7),
        provider: 'google_ads'
      }));
      
      // Construir URL de autorização
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', clientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', scopes);
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');
      
      // Salvar state no localStorage para validação
      localStorage.setItem('oauth_state', state);
      
      // Abrir popup ou redirecionar
      const popup = window.open(
        authUrl.toString(),
        'google_oauth',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );
      
      if (!popup) {
        throw new Error('Popup bloqueado. Permita popups para este site.');
      }
      
      // Monitorar popup
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
        }
      }, 1000);
      
    } catch (error: any) {
      const oauthError = handleOAuthError(error);
      setError(oauthError);
      setIsConnecting(false);
      
      // Log para debugging
      console.error('Google Ads OAuth Error:', {
        error: oauthError,
        retryCount,
        timestamp: new Date().toISOString()
      });
    }
  }, [retryCount]);

  const retryConnection = useCallback(() => {
    if (error?.retryable) {
      setRetryCount(prev => prev + 1);
      setError(null);
      
      // Aguardar tempo especificado antes de tentar novamente
      if (error.retryAfter) {
        setTimeout(() => {
          initiateGoogleAdsConnection();
        }, error.retryAfter);
      } else {
        initiateGoogleAdsConnection();
      }
    }
  }, [error, initiateGoogleAdsConnection]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    isConnecting,
    error,
    retryCount,
    initiateGoogleAdsConnection,
    retryConnection,
    clearError
  };
};
```

### **3. Componente de Diagnóstico OAuth**

#### **Arquivo: `src/components/OAuthDiagnostic.tsx`**
```typescript
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';

interface DiagnosticResult {
  name: string;
  status: 'success' | 'error' | 'warning' | 'checking';
  message: string;
  details?: string;
}

export const OAuthDiagnostic: React.FC = () => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: DiagnosticResult[] = [];

    // 1. Verificar variáveis de ambiente
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    results.push({
      name: 'Google Client ID',
      status: clientId && !clientId.includes('placeholder') ? 'success' : 'error',
      message: clientId ? 'Configurado' : 'Não configurado',
      details: clientId ? `ID: ${clientId.substring(0, 20)}...` : 'Defina VITE_GOOGLE_CLIENT_ID'
    });

    // 2. Verificar URLs de redirect
    const redirectUri = import.meta.env.VITE_OAUTH_REDIRECT_URI;
    results.push({
      name: 'Redirect URI',
      status: redirectUri ? 'success' : 'error',
      message: redirectUri ? 'Configurado' : 'Não configurado',
      details: redirectUri || 'Defina VITE_OAUTH_REDIRECT_URI'
    });

    // 3. Verificar conectividade com Google
    try {
      const response = await fetch('https://accounts.google.com/.well-known/openid_configuration');
      results.push({
        name: 'Conectividade Google',
        status: response.ok ? 'success' : 'error',
        message: response.ok ? 'Conectado' : 'Falha na conexão',
        details: `Status: ${response.status}`
      });
    } catch (error) {
      results.push({
        name: 'Conectividade Google',
        status: 'error',
        message: 'Erro de rede',
        details: 'Verifique conexão com internet'
      });
    }

    // 4. Verificar APIs habilitadas (simulado)
    const apis = ['Google Ads API', 'Analytics API', 'Search Console API'];
    apis.forEach(api => {
      results.push({
        name: api,
        status: 'warning',
        message: 'Verificação manual necessária',
        details: 'Confirme no Google Cloud Console'
      });
    });

    setDiagnostics(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'checking':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      checking: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <Badge className={variants[status]}>
        {status === 'success' ? 'OK' : 
         status === 'error' ? 'ERRO' : 
         status === 'warning' ? 'ATENÇÃO' : 'VERIFICANDO'}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Diagnóstico OAuth Google</CardTitle>
          <Button 
            onClick={runDiagnostics} 
            disabled={isRunning}
            size="sm"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Verificando...' : 'Atualizar'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(diagnostic.status)}
                <div>
                  <div className="font-medium">{diagnostic.name}</div>
                  <div className="text-sm text-gray-500">{diagnostic.details}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(diagnostic.status)}
              </div>
            </div>
          ))}
        </div>
        
        {diagnostics.some(d => d.status === 'error') && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Ações Necessárias:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Configure as variáveis de ambiente no arquivo .env</li>
              <li>• Verifique as credenciais no Google Cloud Console</li>
              <li>• Confirme que as APIs estão habilitadas</li>
              <li>• Aguarde aprovação dos escopos pelo Google</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
```

### **4. Implementar Fallback para Indisponibilidade**

#### **Arquivo: `src/components/IntegrationError.tsx`**
```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Clock, ExternalLink } from 'lucide-react';

interface IntegrationErrorProps {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    retryAfter?: number;
  };
  onRetry?: () => void;
  onDismiss?: () => void;
  retryCount?: number;
}

export const IntegrationError: React.FC<IntegrationErrorProps> = ({
  error,
  onRetry,
  onDismiss,
  retryCount = 0
}) => {
  const getErrorSeverity = () => {
    switch (error.code) {
      case 'GOOGLE_UNAVAILABLE':
      case 'RATE_LIMITED':
        return 'warning';
      case 'INVALID_CREDENTIALS':
      case 'SCOPE_NOT_APPROVED':
        return 'error';
      default:
        return 'error';
    }
  };

  const getErrorIcon = () => {
    const severity = getErrorSeverity();
    return severity === 'warning' ? 
      <Clock className="h-6 w-6 text-yellow-500" /> : 
      <AlertTriangle className="h-6 w-6 text-red-500" />;
  };

  const getErrorTitle = () => {
    switch (error.code) {
      case 'GOOGLE_UNAVAILABLE':
        return 'Serviço Temporariamente Indisponível';
      case 'INVALID_CREDENTIALS':
        return 'Credenciais Inválidas';
      case 'SCOPE_NOT_APPROVED':
        return 'Aguardando Aprovação do Google';
      case 'RATE_LIMITED':
        return 'Limite de Tentativas Excedido';
      default:
        return 'Erro de Integração';
    }
  };

  const getErrorSolution = () => {
    switch (error.code) {
      case 'GOOGLE_UNAVAILABLE':
        return (
          <div className="space-y-2">
            <p>O Google está enfrentando problemas temporários.</p>
            <ul className="text-sm space-y-1">
              <li>• Aguarde alguns minutos e tente novamente</li>
              <li>• Verifique o status dos serviços Google</li>
              <li>• Use dados em cache enquanto isso</li>
            </ul>
          </div>
        );
      case 'INVALID_CREDENTIALS':
        return (
          <div className="space-y-2">
            <p>As credenciais OAuth não estão configuradas corretamente.</p>
            <ul className="text-sm space-y-1">
              <li>• Verifique o Google Cloud Console</li>
              <li>• Confirme o Client ID e Secret</li>
              <li>• Valide as URLs de redirect</li>
            </ul>
          </div>
        );
      case 'SCOPE_NOT_APPROVED':
        return (
          <div className="space-y-2">
            <p>Aguardando aprovação dos escopos pelo Google.</p>
            <ul className="text-sm space-y-1">
              <li>• Processo pode levar 1-2 semanas</li>
              <li>• Verifique o status no Google Console</li>
              <li>• Use modo de desenvolvimento enquanto isso</li>
            </ul>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p>Erro inesperado durante a integração.</p>
            <ul className="text-sm space-y-1">
              <li>• Tente novamente em alguns minutos</li>
              <li>• Verifique sua conexão com internet</li>
              <li>• Entre em contato com o suporte se persistir</li>
            </ul>
          </div>
        );
    }
  };

  const formatRetryTime = () => {
    if (!error.retryAfter) return null;
    const minutes = Math.ceil(error.retryAfter / 60000);
    return `Tente novamente em ${minutes} minuto${minutes > 1 ? 's' : ''}`;
  };

  return (
    <Card className={`border-l-4 ${
      getErrorSeverity() === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'
    }`}>
      <CardHeader>
        <div className="flex items-center space-x-3">
          {getErrorIcon()}
          <div>
            <CardTitle className="text-lg">{getErrorTitle()}</CardTitle>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500">Tentativa {retryCount}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-gray-700">
          {getErrorSolution()}
        </div>
        
        {error.retryAfter && (
          <div className="text-sm text-gray-500">
            {formatRetryTime()}
          </div>
        )}
        
        <div className="flex items-center space-x-3">
          {error.retryable && onRetry && (
            <Button onClick={onRetry} size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          )}
          
          {error.code === 'GOOGLE_UNAVAILABLE' && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open('https://status.cloud.google.com/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Status Google
            </Button>
          )}
          
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              Dispensar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
```

---

## 🚀 **CONFIGURAÇÃO NETLIFY**

### **1. Variáveis de Ambiente Netlify**

```bash
# No painel do Netlify, adicionar em Site Settings > Environment Variables:

VITE_GOOGLE_CLIENT_ID=seu_client_id_real.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=seu_client_secret_real
VITE_OAUTH_REDIRECT_URI=https://metrionix.netlify.app/oauth/callback
VITE_GOOGLE_ADS_DEVELOPER_TOKEN=seu_developer_token
VITE_ENVIRONMENT=production
```

### **2. Headers de Segurança**

#### **Arquivo: `netlify.toml` (atualizar)**
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https: wss:; frame-src 'self' https://accounts.google.com;"
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

## 📋 **CHECKLIST DE IMPLEMENTAÇÃO**

### **Google Cloud Console:**
- [ ] Projeto criado/configurado
- [ ] APIs habilitadas (Ads, Analytics, Search Console)
- [ ] OAuth Consent Screen configurado
- [ ] Credenciais OAuth 2.0 criadas
- [ ] Domínios autorizados adicionados
- [ ] Escopos solicitados para revisão

### **Código:**
- [ ] Variáveis de ambiente atualizadas
- [ ] Tratamento de erros melhorado
- [ ] Componente de diagnóstico adicionado
- [ ] Fallbacks implementados
- [ ] Logs de debugging configurados

### **Deploy:**
- [ ] Variáveis de ambiente no Netlify
- [ ] Headers de segurança atualizados
- [ ] URLs de callback testadas
- [ ] Certificado SSL válido

### **Testes:**
- [ ] Fluxo OAuth em desenvolvimento
- [ ] Fluxo OAuth em produção
- [ ] Tratamento de erros
- [ ] Diagnóstico funcionando
- [ ] Fallbacks ativando corretamente

---

## 🔍 **DEBUGGING E MONITORAMENTO**

### **1. Logs Detalhados**

```typescript
// Adicionar ao useOAuthFlow.ts
const logOAuthAttempt = (data: any) => {
  console.log('OAuth Attempt:', {
    timestamp: new Date().toISOString(),
    environment: import.meta.env.VITE_ENVIRONMENT,
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.substring(0, 20),
    redirectUri: getRedirectUri(),
    ...data
  });
};
```

### **2. Monitoramento de Erros**

```typescript
// Integração com serviço de monitoramento
const reportOAuthError = (error: any) => {
  // Sentry, LogRocket, ou similar
  console.error('OAuth Error Report:', {
    error: error.message,
    stack: error.stack,
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
};
```

---

## 📞 **SUPORTE E PRÓXIMOS PASSOS**

### **Contatos Importantes:**
- **Google Cloud Support:** Para questões de APIs
- **Google Ads API Support:** Para questões específicas do Ads
- **Netlify Support:** Para questões de deploy

### **Documentação Oficial:**
- [Google Ads API](https://developers.google.com/google-ads/api/docs/)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)

### **Próximos Passos:**
1. Implementar as alterações no código
2. Configurar Google Cloud Console
3. Solicitar aprovação dos escopos
4. Testar em ambiente de desenvolvimento
5. Deploy em produção
6. Monitorar logs e métricas

---

**Este guia fornece uma implementação completa e robusta para integração com Google Ads OAuth, incluindo tratamento de erros, fallbacks e monitoramento adequado.**