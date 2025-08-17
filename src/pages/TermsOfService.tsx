import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function TermsOfService() {
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
    document.title = 'Termos de Serviço - Metrionix';
    
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
              Termos de Serviço
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
            <Badge variant="outline" className="mx-auto mt-2">
              Versão 1.0
            </Badge>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Introdução */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Introdução</h2>
              <p className="text-gray-700 leading-relaxed">
                Bem-vindo ao <strong>Metrionix</strong>, uma plataforma SaaS de gestão de marketing digital 
                que oferece dashboards unificados, integrações com Google Ads, Meta Ads, Google Analytics 
                e outras ferramentas de marketing. Estes Termos de Serviço ("Termos") regem o uso de 
                nossa plataforma e serviços relacionados.
              </p>
              <p className="text-gray-700 leading-relaxed mt-3">
                Ao acessar ou usar nossos serviços, você concorda em ficar vinculado a estes Termos. 
                Se você não concordar com qualquer parte destes Termos, não deve usar nossos serviços.
              </p>
            </section>

            <Separator />

            {/* 1. Aceitação dos Termos */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">1. Aceitação dos Termos</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">1.1 Concordância</h3>
                  <p className="text-gray-700">
                    Ao criar uma conta, acessar ou usar qualquer parte de nossos serviços, você:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1 mt-2">
                    <li>Confirma que leu, compreendeu e concorda com estes Termos</li>
                    <li>Aceita ficar legalmente vinculado por estes Termos</li>
                    <li>Confirma que tem capacidade legal para celebrar este acordo</li>
                    <li>Representa que tem pelo menos 18 anos de idade</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">1.2 Capacidade Legal</h3>
                  <p className="text-gray-700">
                    Você declara e garante que:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1 mt-2">
                    <li>É maior de idade em sua jurisdição</li>
                    <li>Tem autoridade para aceitar estes Termos</li>
                    <li>Se representar uma empresa, tem autoridade para vinculá-la</li>
                    <li>Não está proibido de usar nossos serviços por lei</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium">
                    <strong>Importante:</strong> Se você não concordar com estes Termos, 
                    deve interromper imediatamente o uso de nossos serviços.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 2. Uso Aceitável */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">2. Uso Aceitável</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">2.1 Condutas Permitidas</h3>
                  <p className="text-gray-700 mb-2">Você pode usar nossos serviços para:</p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Gerenciar campanhas de marketing digital de forma legítima</li>
                    <li>Criar e visualizar relatórios de performance</li>
                    <li>Integrar contas de publicidade autorizadas</li>
                    <li>Colaborar com membros da sua equipe</li>
                    <li>Acessar dados e métricas de suas campanhas</li>
                    <li>Usar ferramentas de análise e otimização</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">2.2 Condutas Proibidas</h3>
                  <p className="text-gray-700 mb-2">Você NÃO pode:</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">🚫 Atividades Ilegais</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Violar leis ou regulamentos</li>
                        <li>• Promover atividades ilegais</li>
                        <li>• Infringir direitos de terceiros</li>
                        <li>• Usar para fraudes ou golpes</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">🔒 Segurança</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Tentar hackear ou comprometer</li>
                        <li>• Usar malware ou vírus</li>
                        <li>• Acessar contas não autorizadas</li>
                        <li>• Contornar medidas de segurança</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">📊 Dados</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Acessar dados não autorizados</li>
                        <li>• Compartilhar credenciais</li>
                        <li>• Fazer engenharia reversa</li>
                        <li>• Extrair dados em massa</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">⚡ Abuso</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Sobrecarregar nossos servidores</li>
                        <li>• Usar bots ou automação</li>
                        <li>• Criar múltiplas contas</li>
                        <li>• Revender nossos serviços</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">2.3 Monitoramento e Conformidade</h3>
                  <p className="text-gray-700">
                    Reservamo-nos o direito de monitorar o uso de nossos serviços para garantir 
                    conformidade com estes Termos. Podemos investigar violações e tomar medidas 
                    apropriadas, incluindo suspensão ou encerramento de contas.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 3. Propriedade Intelectual */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">3. Propriedade Intelectual</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">3.1 Nossos Direitos</h3>
                  <p className="text-gray-700 mb-2">
                    Todos os direitos de propriedade intelectual relacionados ao Metrionix são de nossa propriedade ou licenciados para nós, incluindo:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li><strong>Software:</strong> Código-fonte, algoritmos, arquitetura</li>
                    <li><strong>Design:</strong> Interface, layouts, elementos visuais</li>
                    <li><strong>Conteúdo:</strong> Textos, imagens, vídeos, documentação</li>
                    <li><strong>Marcas:</strong> Nome, logotipo, slogans, marcas registradas</li>
                    <li><strong>Dados:</strong> Métricas agregadas, insights, relatórios</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">3.2 Licença de Uso</h3>
                  <p className="text-gray-700">
                    Concedemos a você uma licença limitada, não exclusiva, não transferível e 
                    revogável para usar nossos serviços de acordo com estes Termos. Esta licença:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1 mt-2">
                    <li>É pessoal e intransferível</li>
                    <li>Não inclui direitos de sublicenciamento</li>
                    <li>Pode ser revogada a qualquer momento</li>
                    <li>Termina automaticamente se você violar estes Termos</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">3.3 Seus Dados</h3>
                  <p className="text-gray-700">
                    Você mantém a propriedade de seus dados de marketing, campanhas e conteúdo 
                    que carrega em nossa plataforma. Ao usar nossos serviços, você nos concede 
                    uma licença limitada para processar esses dados conforme necessário para 
                    fornecer nossos serviços.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">3.4 Proteção de Direitos</h3>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>Aviso:</strong> Qualquer uso não autorizado de nossa propriedade 
                      intelectual pode resultar em ação legal. Respeitamos os direitos de 
                      propriedade intelectual de terceiros e esperamos que nossos usuários 
                      façam o mesmo.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <Separator />

            {/* 4. Limitação de Responsabilidade */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">4. Limitação de Responsabilidade</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">4.1 Isenção de Garantias</h3>
                  <p className="text-gray-700">
                    Nossos serviços são fornecidos "como estão" e "conforme disponíveis". 
                    Não oferecemos garantias expressas ou implícitas, incluindo mas não 
                    limitado a:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1 mt-2">
                    <li>Garantias de comercialização</li>
                    <li>Adequação para fins específicos</li>
                    <li>Não violação de direitos de terceiros</li>
                    <li>Operação ininterrupta ou livre de erros</li>
                    <li>Precisão ou confiabilidade dos dados</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">4.2 Limitação de Danos</h3>
                  <p className="text-gray-700 mb-2">
                    Em nenhuma circunstância seremos responsáveis por:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Danos Diretos</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Perda de receita</li>
                        <li>• Perda de lucros</li>
                        <li>• Perda de dados</li>
                        <li>• Interrupção de negócios</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Danos Indiretos</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Danos consequenciais</li>
                        <li>• Danos punitivos</li>
                        <li>• Danos especiais</li>
                        <li>• Danos incidentais</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">4.3 Limite Máximo</h3>
                  <p className="text-gray-700">
                    Nossa responsabilidade total por qualquer reclamação relacionada aos 
                    nossos serviços não excederá o valor pago por você nos 12 meses 
                    anteriores ao evento que deu origem à reclamação.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">4.4 Serviços de Terceiros</h3>
                  <p className="text-gray-700">
                    Não somos responsáveis por serviços de terceiros integrados à nossa 
                    plataforma (Google, Meta, etc.). Seu uso desses serviços está sujeito 
                    aos termos e políticas dos respectivos provedores.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 5. Indenização */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">5. Indenização</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">5.1 Obrigação de Indenizar</h3>
                  <p className="text-gray-700">
                    Você concorda em indenizar, defender e isentar nossa empresa, diretores, 
                    funcionários, agentes e afiliados de qualquer reclamação, demanda, 
                    responsabilidade, dano, perda, custo ou despesa (incluindo honorários 
                    advocatícios razoáveis) decorrentes de:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1 mt-2">
                    <li>Seu uso dos nossos serviços</li>
                    <li>Violação destes Termos</li>
                    <li>Violação de direitos de terceiros</li>
                    <li>Seu conteúdo ou dados</li>
                    <li>Atividades ilegais ou negligentes</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">5.2 Processo de Defesa</h3>
                  <p className="text-gray-700">
                    Reservamo-nos o direito de assumir a defesa exclusiva de qualquer 
                    questão sujeita à indenização por você. Neste caso, você cooperará 
                    conosco na defesa de tais reclamações.
                  </p>
                </div>
                
                <div className="bg-orange-50 p-4 rounded-lg">
                  <p className="text-orange-800">
                    <strong>Importante:</strong> Esta cláusula de indenização permanece 
                    em vigor mesmo após o término destes Termos.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 6. Rescisão */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">6. Rescisão</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">6.1 Rescisão por Você</h3>
                  <p className="text-gray-700">
                    Você pode encerrar sua conta a qualquer momento através das 
                    configurações da conta ou entrando em contato conosco. O encerramento 
                    será efetivo no final do período de faturamento atual.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">6.2 Rescisão por Nós</h3>
                  <p className="text-gray-700 mb-2">
                    Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, se:
                  </p>
                  <ul className="list-disc list-inside ml-4 text-gray-700 space-y-1">
                    <li>Você violar estes Termos</li>
                    <li>Seu uso representar risco de segurança</li>
                    <li>Você não pagar taxas devidas</li>
                    <li>Solicitado por autoridades legais</li>
                    <li>Descontinuarmos nossos serviços</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">6.3 Efeitos da Rescisão</h3>
                  <p className="text-gray-700 mb-2">
                    Após o encerramento da conta:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">Cessam Imediatamente</h4>
                      <ul className="text-sm text-red-700 space-y-1">
                        <li>• Acesso aos serviços</li>
                        <li>• Direito de uso da plataforma</li>
                        <li>• Suporte técnico</li>
                        <li>• Novos recursos</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Permanecem em Vigor</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Cláusulas de indenização</li>
                        <li>• Limitação de responsabilidade</li>
                        <li>• Propriedade intelectual</li>
                        <li>• Resolução de disputas</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">6.4 Recuperação de Dados</h3>
                  <p className="text-gray-700">
                    Após o encerramento, você terá 30 dias para exportar seus dados. 
                    Após este período, poderemos excluir permanentemente todos os dados 
                    associados à sua conta.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 7. Resolução de Disputas */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">7. Resolução de Disputas</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">7.1 Negociação Direta</h3>
                  <p className="text-gray-700">
                    Antes de iniciar qualquer procedimento formal, as partes devem tentar 
                    resolver disputas através de negociação direta por um período mínimo 
                    de 30 dias.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">7.2 Mediação</h3>
                  <p className="text-gray-700">
                    Se a negociação direta não resolver a disputa, as partes concordam 
                    em submeter a questão à mediação antes de qualquer litígio.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">7.3 Jurisdição e Lei Aplicável</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <p className="text-blue-800">
                        <strong>Lei Aplicável:</strong> Estes Termos são regidos pelas leis 
                        da República Federativa do Brasil.
                      </p>
                      <p className="text-blue-800">
                        <strong>Jurisdição:</strong> Qualquer disputa será submetida à 
                        jurisdição exclusiva dos tribunais brasileiros.
                      </p>
                      <p className="text-blue-800">
                        <strong>Idioma:</strong> Todos os procedimentos serão conduzidos 
                        em português.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">7.4 Limitação de Tempo</h3>
                  <p className="text-gray-700">
                    Qualquer reclamação deve ser apresentada dentro de 1 (um) ano após 
                    o evento que deu origem à disputa. Após este período, a reclamação 
                    será considerada prescrita.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">7.5 Renúncia a Ação Coletiva</h3>
                  <p className="text-gray-700">
                    Você concorda em resolver disputas individualmente e renuncia ao 
                    direito de participar de ações coletivas ou representativas.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* 8. Alterações nos Termos */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">8. Alterações nos Termos</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">8.1 Direito de Modificação</h3>
                  <p className="text-gray-700">
                    Reservamo-nos o direito de modificar estes Termos a qualquer momento 
                    para refletir mudanças em nossos serviços, práticas comerciais ou 
                    requisitos legais.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">8.2 Processo de Notificação</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold">Alterações Menores:</h4>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        <li>Notificação na plataforma</li>
                        <li>Atualização da data de "última modificação"</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Alterações Significativas:</h4>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        <li>E-mail para todos os usuários</li>
                        <li>Notificação destacada na plataforma</li>
                        <li>Período de 30 dias antes da vigência</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold">Alterações Substanciais:</h4>
                      <ul className="list-disc list-inside ml-4 text-gray-700">
                        <li>Notificação por múltiplos canais</li>
                        <li>Período de 60 dias antes da vigência</li>
                        <li>Opção de cancelamento sem penalidade</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">8.3 Aceitação de Alterações</h3>
                  <p className="text-gray-700">
                    O uso continuado de nossos serviços após a notificação de alterações 
                    constitui aceitação dos novos Termos. Se você não concordar com as 
                    alterações, deve encerrar sua conta antes da data de vigência.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">8.4 Histórico de Versões</h3>
                  <p className="text-gray-700">
                    Mantemos um histórico das versões anteriores destes Termos, disponível 
                    mediante solicitação para fins de transparência e conformidade.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Disposições Gerais */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Disposições Gerais</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-medium mb-2">Integralidade do Acordo</h3>
                  <p className="text-gray-700">
                    Estes Termos, juntamente com nossa Política de Privacidade, constituem 
                    o acordo integral entre você e nossa empresa, substituindo todos os 
                    acordos anteriores.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">Divisibilidade</h3>
                  <p className="text-gray-700">
                    Se qualquer disposição destes Termos for considerada inválida ou 
                    inexequível, as demais disposições permanecerão em pleno vigor.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">Renúncia</h3>
                  <p className="text-gray-700">
                    A falha em exercer qualquer direito ou disposição destes Termos não 
                    constituirá renúncia a tal direito ou disposição.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium mb-2">Cessão</h3>
                  <p className="text-gray-700">
                    Você não pode ceder ou transferir seus direitos sob estes Termos sem 
                    nosso consentimento prévio por escrito. Podemos ceder nossos direitos 
                    a qualquer momento.
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Informações de Contato */}
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-primary">Informações de Contato</h2>
              
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-3">Questões Legais</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>E-mail:</strong> alandersonverissimo@gmail.com</p>
                      <p><strong>Assunto:</strong> [LEGAL] Termos de Serviço</p>
                      <p><strong>Resposta:</strong> Até 5 dias úteis</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-xl font-medium mb-3">Suporte Geral</h3>
                    <div className="space-y-2 text-gray-700">
                      <p><strong>E-mail:</strong> alandersonverissimo@gmail.com</p>
                      <p><strong>Assunto:</strong> [SUPORTE] Dúvidas Gerais</p>
                      <p><strong>Resposta:</strong> Até 24 horas</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-3 text-green-800">Documentos Relacionados</h3>
                  <p className="text-green-700">
                    Para informações sobre como tratamos seus dados pessoais, consulte nossa 
                    <strong> Política de Privacidade</strong>. Para dúvidas sobre faturamento 
                    e pagamentos, consulte nossos <strong>Termos de Pagamento</strong>.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer */}
            <div className="text-center pt-8 border-t">
              <p className="text-sm text-gray-500">
                Estes Termos de Serviço estão em conformidade com o Código de Defesa do Consumidor, 
                Marco Civil da Internet e demais leis aplicáveis no Brasil.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Documento ID: TOS-2025-001 | Versão: 1.0 | Idioma: Português (Brasil)
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Para questões sobre estes termos: alandersonverissimo@gmail.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}