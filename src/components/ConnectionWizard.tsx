import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { useOAuthFlow } from '@/hooks/useOAuthFlow';

export interface Step {
  id: string;
  title: string;
  description: string;
  component?: React.ReactNode;
  isOptional?: boolean;
}

interface ConnectionWizardProps {
  platform: 'google-ads' | 'meta-ads' | 'ga4' | 'search-console' | 'woocommerce';
  steps?: Step[];
  onComplete: (data: any) => void;
  onCancel: () => void;
  isOpen: boolean;
}

const defaultSteps: Record<string, Step[]> = {
  'google-ads': [
    {
      id: 'intro',
      title: 'Conectar Google Ads',
      description: 'Vamos conectar sua conta do Google Ads para importar dados de campanhas e métricas de performance.',
    },
    {
      id: 'auth',
      title: 'Autenticar com Google',
      description: 'Clique no botão abaixo para autorizar acesso à sua conta Google Ads.',
    },
    {
      id: 'select-account',
      title: 'Selecionar Conta',
      description: 'Selecione qual conta do Google Ads você deseja conectar.',
    },
    {
      id: 'confirm',
      title: 'Confirmar Permissões',
      description: 'Confirme as permissões necessárias para importar seus dados.',
    },
    {
      id: 'success',
      title: 'Conexão Concluída',
      description: 'Sua conta Google Ads foi conectada com sucesso!',
    },
  ],
  'meta-ads': [
    {
      id: 'intro',
      title: 'Conectar Meta Ads',
      description: 'Vamos conectar sua conta do Meta Ads para importar dados de campanhas do Facebook e Instagram.',
    },
    {
      id: 'auth',
      title: 'Autenticar com Meta',
      description: 'Clique no botão abaixo para autorizar acesso à sua conta Meta Ads.',
    },
    {
      id: 'select-account',
      title: 'Selecionar Conta',
      description: 'Selecione qual conta de anúncios você deseja conectar.',
    },
    {
      id: 'success',
      title: 'Conexão Concluída',
      description: 'Sua conta Meta Ads foi conectada com sucesso!',
    },
  ],
  'woocommerce': [
    {
      id: 'intro',
      title: 'Conectar WooCommerce',
      description: 'Vamos conectar sua loja WooCommerce para importar dados de vendas e produtos.',
    },
    {
      id: 'generate-keys',
      title: 'Gerar Chaves API',
      description: 'Siga as instruções abaixo para gerar as chaves de API no seu painel WooCommerce.',
      component: <WooCommerceInstructions />,
    },
    {
      id: 'enter-keys',
      title: 'Inserir Chaves',
      description: 'Insira as chaves de API geradas no painel do WooCommerce.',
      component: <WooCommerceKeyForm />,
    },
    {
      id: 'test-connection',
      title: 'Testar Conexão',
      description: 'Vamos testar a conexão com sua loja WooCommerce.',
    },
    {
      id: 'success',
      title: 'Conexão Concluída',
      description: 'Sua loja WooCommerce foi conectada com sucesso!',
    },
  ],
  'ga4': [
    {
      id: 'intro',
      title: 'Conectar Google Analytics 4',
      description: 'Vamos conectar sua conta do Google Analytics 4 para importar métricas de tráfego e comportamento.',
    },
    {
      id: 'auth',
      title: 'Autenticar com Google',
      description: 'Clique no botão abaixo para autorizar acesso à sua conta Google Analytics.',
    },
    {
      id: 'select-property',
      title: 'Selecionar Propriedade',
      description: 'Selecione qual propriedade do GA4 você deseja conectar.',
    },
    {
      id: 'success',
      title: 'Conexão Concluída',
      description: 'Sua conta Google Analytics 4 foi conectada com sucesso!',
    },
  ],
  'search-console': [
    {
      id: 'intro',
      title: 'Conectar Search Console',
      description: 'Vamos conectar sua conta do Google Search Console para importar dados de SEO e performance de busca.',
    },
    {
      id: 'auth',
      title: 'Autenticar com Google',
      description: 'Clique no botão abaixo para autorizar acesso à sua conta Search Console.',
    },
    {
      id: 'select-property',
      title: 'Selecionar Propriedade',
      description: 'Selecione qual propriedade do Search Console você deseja conectar.',
    },
    {
      id: 'success',
      title: 'Conexão Concluída',
      description: 'Sua conta Search Console foi conectada com sucesso!',
    },
  ],
};

// Componente para instruções do WooCommerce
function WooCommerceInstructions() {
  return (
    <div className="space-y-3 sm:space-y-4 my-3 sm:my-4">
      <ol className="list-decimal pl-4 sm:pl-5 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
        <li>Acesse o painel administrativo da sua loja WooCommerce</li>
        <li>Navegue até <strong>WooCommerce &gt; Configurações &gt; Avançado &gt; REST API</strong></li>
        <li>Clique em <strong>Adicionar chave</strong></li>
        <li>Preencha uma descrição (ex: "Metrionix")</li>
        <li>Selecione <strong>Permissões: Leitura/Escrita</strong></li>
        <li>Clique em <strong>Gerar chave API</strong></li>
        <li>Copie a <strong>Consumer Key</strong> e <strong>Consumer Secret</strong> geradas</li>
      </ol>
      <div className="bg-yellow-50 p-2 sm:p-3 rounded-md border border-yellow-200 text-yellow-800 text-xs sm:text-sm">
        <AlertCircle className="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
        Importante: Guarde essas chaves em um local seguro. Você não poderá visualizar a Consumer Secret novamente.
      </div>
    </div>
  );
}

// Componente para formulário de chaves WooCommerce
function WooCommerceKeyForm() {
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [storeUrl, setStoreUrl] = useState('');

  return (
    <div className="space-y-3 sm:space-y-4 my-3 sm:my-4">
      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="store-url" className="text-xs sm:text-sm font-medium">
          URL da Loja
        </label>
        <input
          id="store-url"
          type="text"
          className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded-md"
          placeholder="https://sualoja.com.br"
          value={storeUrl}
          onChange={(e) => setStoreUrl(e.target.value)}
        />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="consumer-key" className="text-xs sm:text-sm font-medium">
          Consumer Key
        </label>
        <input
          id="consumer-key"
          type="text"
          className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded-md"
          placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={consumerKey}
          onChange={(e) => setConsumerKey(e.target.value)}
        />
      </div>
      <div className="space-y-1.5 sm:space-y-2">
        <label htmlFor="consumer-secret" className="text-xs sm:text-sm font-medium">
          Consumer Secret
        </label>
        <input
          id="consumer-secret"
          type="text"
          className="w-full p-1.5 sm:p-2 text-xs sm:text-sm border rounded-md"
          placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          value={consumerSecret}
          onChange={(e) => setConsumerSecret(e.target.value)}
        />
      </div>
    </div>
  );
}

export function ConnectionWizard({
  platform,
  steps = defaultSteps[platform] || [],
  onComplete,
  onCancel,
  isOpen,
}: ConnectionWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  const { initiateConnection, isConnecting } = useOAuthFlow();

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const isSuccessStep = currentStep?.id === 'success';

  const handleNext = async () => {
    if (isLastStep) {
      onComplete(formData);
      return;
    }

    const nextStep = steps[currentStepIndex + 1];

    // Se o próximo passo for autenticação, iniciar fluxo OAuth
    if (nextStep?.id === 'auth') {
      setIsLoading(true);
      try {
        // Mapear plataforma para o provedor OAuth correto
        const oauthProvider = platform === 'google-ads' || platform === 'ga4' || platform === 'search-console' 
          ? 'google' 
          : platform === 'meta-ads' 
            ? 'meta' 
            : 'woocommerce';

        await initiateConnection(oauthProvider as any);
        // Não avançamos para o próximo passo aqui, isso será feito após o callback OAuth bem-sucedido
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao iniciar autenticação');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Para outros passos, simplesmente avançar
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleCancel = () => {
    setCurrentStepIndex(0);
    setFormData({});
    setError(null);
    onCancel();
  };

  const updateFormData = (data: Record<string, any>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-[90vw] sm:max-w-[500px] p-4 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-3">
          <DialogTitle className="text-base sm:text-lg">{currentStep?.title}</DialogTitle>
        </DialogHeader>

        <div className="py-3 sm:py-4">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5 mb-4 sm:mb-6">
            <div
              className="bg-blue-600 h-2 sm:h-2.5 rounded-full"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            ></div>
          </div>

          {/* Step description */}
          <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">{currentStep?.description}</p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 p-2 sm:p-3 rounded-md border border-red-200 text-red-800 text-xs sm:text-sm mb-3 sm:mb-4">
              <AlertCircle className="inline-block w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              {error}
            </div>
          )}

          {/* Step content */}
          {currentStep?.component}

          {/* Success step */}
          {isSuccessStep && (
            <div className="flex flex-col items-center justify-center py-4 sm:py-6">
              <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mb-3 sm:mb-4" />
              <p className="text-center font-medium text-sm sm:text-base">Conexão realizada com sucesso!</p>
              <p className="text-center text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">
                Seus dados começarão a ser sincronizados em breve.
              </p>
            </div>
          )}

          {/* Auth step */}
          {currentStep?.id === 'auth' && (
            <div className="flex justify-center py-3 sm:py-4">
              <Button
                onClick={handleNext}
                disabled={isLoading || isConnecting}
                className="w-full max-w-xs text-xs sm:text-sm h-8 sm:h-10"
              >
                {isLoading || isConnecting ? (
                  <>
                    <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  `Conectar com ${platform === 'meta-ads' ? 'Meta' : 'Google'}`
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0">
          {!isSuccessStep ? (
            <>
              <Button 
                variant="outline" 
                onClick={handleCancel} 
                className="order-2 sm:order-1 text-xs sm:text-sm h-8 sm:h-10"
              >
                Cancelar
              </Button>
              <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto justify-end">
                {!isFirstStep && (
                  <Button 
                    variant="outline" 
                    onClick={handleBack}
                    className="text-xs sm:text-sm h-8 sm:h-10"
                  >
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="sm:inline hidden">Voltar</span>
                    <span className="sm:hidden inline">Voltar</span>
                  </Button>
                )}
                {currentStep?.id !== 'auth' && (
                  <Button 
                    onClick={handleNext} 
                    disabled={isLoading}
                    className="text-xs sm:text-sm h-8 sm:h-10"
                  >
                    {isLastStep ? 'Concluir' : 'Próximo'}
                    {!isLastStep && <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />}
                  </Button>
                )}
              </div>
            </>
          ) : (
            <Button 
              onClick={handleCancel} 
              className="ml-auto text-xs sm:text-sm h-8 sm:h-10"
            >
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}