import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function PrivacyPolicy() {
  // Configurar meta tags para não indexação
  useEffect(() => {
    // Adicionar meta tag noindex
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow, noarchive, nosnippet';
    document.head.appendChild(metaRobots);
    
    // Adicionar meta tag para não cache
    const metaCache = document.createElement('meta');
    metaCache.httpEquiv = 'Cache-Control';
    metaCache.content = 'no-cache, no-store, must-revalidate';
    document.head.appendChild(metaCache);
    
    // Definir título da página
    document.title = 'Política de Privacidade - Metrionix';
    
    // Cleanup ao desmontar o componente
    return () => {
      document.head.removeChild(metaRobots);
      document.head.removeChild(metaCache);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">
              Política de Privacidade
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Introdução */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Introdução</h2>
              <p className="text-gray-700 leading-relaxed">
                Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos 
                suas informações pessoais quando você utiliza nossa plataforma de gestão de marketing digital. 
                Estamos comprometidos em proteger sua privacidade e garantir a transparência sobre nossas 
                práticas de dados, em conformidade com a Lei Geral de Proteção de Dados (LGPD) e 
                regulamentações internacionais como o GDPR.
              </p>
            </section>

            <Separator />

            {/* 1. Coleta de Dados */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">1. Coleta de Dados</h2>
              
              <h3 className="text-xl font-medium mb-3">1.1 Tipos de Dados Coletados</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold">Dados de Identificação:</h4>
                  <ul className="list-disc list-inside ml-4 text-gray-700">
                    <li>Nome completo</li>
                    <li>Endereço de e-mail</li>
                    <li>Número de telefone</li>
                    <li>Nome da empresa/agência</li>
                    <li>Cargo/função</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Dados Técnicos:</h4>
                  <ul className="list-disc list-inside ml-4 text-gray-700">
                    <li>Endereço IP</li>
                    <li>Tipo e versão do navegador</li>
                    <li>Sistema operacional</li>
                    <li>Dados de localização aproximada</li>
                    <li>Identificadores únicos de dispositivo</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Dados de Navegação:</h4>
                  <ul className="list-disc list-inside ml-4 text-gray-700">
                    <li>Páginas visitadas</li>
                    <li>Tempo de permanência</li>
                    <li>Cliques e interações</li>
                    <li>Referências de origem</li>
                    <li>Histórico de navegação na plataforma</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold">Dados de Integração:</h4>
                  <ul className="list-disc list-inside ml-4 text-gray-700">
                    <li>Tokens de acesso OAuth (Google, Meta)</li>
                    <li>IDs de contas publicitárias</li>
                    <li>Métricas e dados de campanhas</li>
                    <li>Configurações de integração</li>
                  </ul>
                </div>
              </div>
              
              <h3 className="text-xl font-medium mb-3 mt-6">1.2 Métodos de Coleta</h3>
              <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                <li><strong>Formulários:</strong> Registro, login, configurações de perfil</li>
                <li><strong>Cookies:</strong> Rastreamento de sessão e preferências</li>
                <li><strong>Analytics:</strong> Google Analytics e ferramentas similares</li>
                <li><strong>APIs:</strong> Integrações com Google Ads, Meta Ads, Analytics</li>
                <li><strong>Logs do servidor:</strong> Registros automáticos de acesso</li>
                <li><strong>Interações diretas:</strong> Suporte ao cliente, feedback</li>
              </ul>
            </section>

            <Separator />

            {/* 2. Uso dos Dados */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">2. Uso dos Dados</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">2.1 Finalidades Principais</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li><strong>Prestação de Serviços:</strong> Fornecer acesso à plataforma e suas funcionalidades</li>
                    <li><strong>Autenticação:</strong> Verificar identidade e manter sessões seguras</li>
                    <li><strong>Personalização:</strong> Customizar dashboards e relatórios</li>
                    <li><strong>Integração:</strong> Conectar e sincronizar dados de plataformas externas</li>
                    <li><strong>Análise:</strong> Gerar insights e relatórios de performance</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">2.2 Comunicação</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Notificações sobre atualizações da plataforma</li>
                    <li>Alertas de segurança e manutenção</li>
                    <li>Suporte técnico e atendimento ao cliente</li>
                    <li>Comunicações transacionais (confirmações, faturas)</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">2.3 Melhoria de Serviços</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Análise de uso para otimização da plataforma</li>
                    <li>Desenvolvimento de novas funcionalidades</li>
                    <li>Correção de bugs e problemas técnicos</li>
                    <li>Pesquisa e desenvolvimento de produtos</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">2.4 Marketing (com consentimento)</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Envio de newsletters e conteúdo educativo</li>
                    <li>Promoções e ofertas especiais</li>
                    <li>Pesquisas de satisfação</li>
                    <li>Webinars e eventos</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* 3. Compartilhamento de Dados */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">3. Compartilhamento de Dados</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">3.1 Prestadores de Serviço</h3>
                  <p className="text-gray-700 mb-2">
                    Compartilhamos dados com terceiros que nos ajudam a operar nossa plataforma:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li><strong>Supabase:</strong> Banco de dados e autenticação</li>
                    <li><strong>Netlify:</strong> Hospedagem e CDN</li>
                    <li><strong>Google Cloud:</strong> Infraestrutura e APIs</li>
                    <li><strong>Meta:</strong> APIs de publicidade</li>
                    <li><strong>Provedores de email:</strong> Envio de comunicações</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">3.2 Parceiros de Integração</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Google (Ads, Analytics, Search Console)</li>
                    <li>Meta (Facebook Ads, Instagram Ads)</li>
                    <li>Outras plataformas de marketing conforme solicitado</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">3.3 Exigências Legais</h3>
                  <p className="text-gray-700">
                    Podemos divulgar dados quando exigido por lei, ordem judicial, ou para:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Cumprir obrigações legais</li>
                    <li>Proteger direitos e segurança</li>
                    <li>Investigar fraudes ou violações</li>
                    <li>Cooperar com autoridades competentes</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    <strong>Importante:</strong> Nunca vendemos, alugamos ou comercializamos 
                    seus dados pessoais para terceiros para fins de marketing.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 4. Segurança dos Dados */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">4. Segurança dos Dados</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">4.1 Medidas Técnicas</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li><strong>Criptografia:</strong> TLS/SSL para transmissão, AES-256 para armazenamento</li>
                    <li><strong>Autenticação:</strong> OAuth 2.0, autenticação multifator</li>
                    <li><strong>Controle de Acesso:</strong> Row Level Security (RLS) no banco de dados</li>
                    <li><strong>Monitoramento:</strong> Logs de auditoria e detecção de anomalias</li>
                    <li><strong>Backup:</strong> Backups regulares e criptografados</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">4.2 Medidas Organizacionais</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Acesso limitado por função (princípio do menor privilégio)</li>
                    <li>Treinamento regular da equipe em segurança</li>
                    <li>Políticas de segurança da informação</li>
                    <li>Avaliações regulares de segurança</li>
                    <li>Plano de resposta a incidentes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">4.3 Infraestrutura</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Servidores em data centers certificados (SOC 2, ISO 27001)</li>
                    <li>Firewall e proteção DDoS</li>
                    <li>Atualizações regulares de segurança</li>
                    <li>Isolamento de ambientes (produção/desenvolvimento)</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator />

            {/* 5. Direitos do Usuário */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">5. Direitos do Usuário</h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Você possui os seguintes direitos em relação aos seus dados pessoais:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🔍 Acesso</h4>
                    <p className="text-sm text-gray-700">
                      Solicitar cópia dos dados que temos sobre você
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">✏️ Correção</h4>
                    <p className="text-sm text-gray-700">
                      Corrigir dados incorretos ou incompletos
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">🗑️ Exclusão</h4>
                    <p className="text-sm text-gray-700">
                      Solicitar a remoção de seus dados pessoais
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">📦 Portabilidade</h4>
                    <p className="text-sm text-gray-700">
                      Receber seus dados em formato estruturado
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">⛔ Oposição</h4>
                    <p className="text-sm text-gray-700">
                      Opor-se ao processamento de seus dados
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">⏸️ Limitação</h4>
                    <p className="text-sm text-gray-700">
                      Restringir o processamento em certas situações
                    </p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-800">Como Exercer Seus Direitos</h4>
                  <p className="text-green-700">
                    Para exercer qualquer destes direitos, entre em contato conosco através do 
                    e-mail <strong>alandersonverissimo@gmail.com</strong> com o assunto 
                    "[PRIVACIDADE] Solicitação LGPD" ou através das configurações da sua conta 
                    na plataforma. Responderemos em até 15 dias úteis.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 6. Cookies e Tecnologias Semelhantes */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">6. Cookies e Tecnologias Semelhantes</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">6.1 Tipos de Cookies</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">Cookies Essenciais (Obrigatórios)</h4>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        <li>Autenticação e sessão do usuário</li>
                        <li>Segurança e prevenção de fraudes</li>
                        <li>Funcionalidades básicas da plataforma</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Cookies de Performance (Opcionais)</h4>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        <li>Google Analytics para análise de uso</li>
                        <li>Monitoramento de performance</li>
                        <li>Otimização de carregamento</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Cookies de Funcionalidade (Opcionais)</h4>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        <li>Preferências de idioma e tema</li>
                        <li>Configurações personalizadas</li>
                        <li>Lembrar escolhas do usuário</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">6.2 Gerenciamento de Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    Você pode gerenciar cookies através de:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Configurações do seu navegador</li>
                    <li>Banner de consentimento em nosso site</li>
                    <li>Configurações de privacidade na sua conta</li>
                    <li>Ferramentas de opt-out de terceiros</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800">
                    <strong>Atenção:</strong> Desabilitar cookies essenciais pode afetar 
                    o funcionamento da plataforma.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 7. Retenção de Dados */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">7. Retenção de Dados</h2>
              
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-3 text-left">Tipo de Dado</th>
                        <th className="border border-gray-300 p-3 text-left">Período de Retenção</th>
                        <th className="border border-gray-300 p-3 text-left">Justificativa</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">Dados de conta ativa</td>
                        <td className="border border-gray-300 p-3">Durante a vigência da conta</td>
                        <td className="border border-gray-300 p-3">Prestação de serviços</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Dados de conta inativa</td>
                        <td className="border border-gray-300 p-3">12 meses após inatividade</td>
                        <td className="border border-gray-300 p-3">Possível reativação</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Logs de acesso</td>
                        <td className="border border-gray-300 p-3">6 meses</td>
                        <td className="border border-gray-300 p-3">Segurança e auditoria</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Dados de marketing</td>
                        <td className="border border-gray-300 p-3">Até revogação do consentimento</td>
                        <td className="border border-gray-300 p-3">Comunicação autorizada</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Dados financeiros</td>
                        <td className="border border-gray-300 p-3">5 anos</td>
                        <td className="border border-gray-300 p-3">Obrigações fiscais</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Backups</td>
                        <td className="border border-gray-300 p-3">30 dias</td>
                        <td className="border border-gray-300 p-3">Recuperação de dados</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="text-gray-700">
                  Após os períodos especificados, os dados são automaticamente excluídos 
                  de nossos sistemas, exceto quando a retenção for exigida por lei.
                </p>
              </div>
            </section>

            <Separator />

            {/* 8. Alterações na Política */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">8. Alterações na Política de Privacidade</h2>
              
              <div className="space-y-4">
                <p className="text-gray-700">
                  Podemos atualizar esta Política de Privacidade periodicamente para refletir 
                  mudanças em nossas práticas, tecnologias ou requisitos legais.
                </p>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">8.1 Processo de Notificação</h3>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li><strong>Alterações Menores:</strong> Notificação na plataforma</li>
                    <li><strong>Alterações Significativas:</strong> E-mail + notificação na plataforma</li>
                    <li><strong>Alterações Substanciais:</strong> Novo consentimento pode ser solicitado</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">8.2 Prazo de Notificação</h3>
                  <p className="text-gray-700">
                    Notificaremos sobre alterações com pelo menos 30 dias de antecedência, 
                    exceto quando mudanças forem exigidas por lei ou para proteger a segurança.
                  </p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    <strong>Recomendação:</strong> Revise esta política periodicamente para 
                    se manter informado sobre como protegemos seus dados.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 9. Informações de Contato */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">9. Informações de Contato</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-3">Encarregado de Dados (DPO)</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>E-mail:</strong> alandersonverissimo@gmail.com</p>
                      <p><strong>Assunto:</strong> [PRIVACIDADE] Solicitação LGPD</p>
                      <p><strong>Tempo de resposta:</strong> Até 15 dias úteis</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-3">Suporte Geral</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>E-mail:</strong> alandersonverissimo@gmail.com</p>
                      <p><strong>Assunto:</strong> [SUPORTE] Dúvidas Gerais</p>
                      <p><strong>Tempo de resposta:</strong> Até 24 horas</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-3 text-green-800">Autoridades de Proteção de Dados</h3>
                  <p className="text-green-700 mb-2">
                    Você também tem o direito de apresentar uma reclamação às autoridades 
                    de proteção de dados competentes:
                  </p>
                  <div className="space-y-1 text-green-700">
                    <p><strong>Brasil:</strong> Autoridade Nacional de Proteção de Dados (ANPD)</p>
                    <p><strong>Website:</strong> gov.br/anpd</p>
                    <p><strong>Europa:</strong> Autoridade de proteção de dados do seu país</p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* Informações Legais */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Informações Legais</h2>
              
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-medium mb-2">Base Legal para Processamento</h3>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li><strong>Execução de contrato:</strong> Prestação de serviços contratados</li>
                    <li><strong>Consentimento:</strong> Marketing e cookies não essenciais</li>
                    <li><strong>Interesse legítimo:</strong> Segurança, melhoria de serviços</li>
                    <li><strong>Obrigação legal:</strong> Cumprimento de leis aplicáveis</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">Transferências Internacionais</h3>
                  <p>
                    Alguns de nossos prestadores de serviço podem estar localizados fora do Brasil. 
                    Garantimos que essas transferências sejam realizadas com adequadas salvaguardas, 
                    incluindo cláusulas contratuais padrão aprovadas e certificações de adequação.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">Menores de Idade</h3>
                  <p>
                    Nossa plataforma não é destinada a menores de 18 anos. Não coletamos 
                    intencionalmente dados de menores. Se tomarmos conhecimento de que 
                    coletamos dados de um menor, tomaremos medidas para excluí-los.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-8 border-t">
              <p className="text-sm text-gray-500">
                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD), 
                Regulamento Geral sobre a Proteção de Dados (GDPR) e outras leis aplicáveis de proteção de dados.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Documento ID: PP-2025-001 | Versão: 1.0
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}