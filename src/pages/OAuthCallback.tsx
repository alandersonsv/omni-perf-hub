import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = () => {
      // Extrair parâmetros da URL
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Verificar se há erro na resposta OAuth
      if (error) {
        const errorMessage = errorDescription || error;
        console.error('Erro OAuth:', errorMessage);
        
        // Enviar erro para a janela pai
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            error: errorMessage,
            code: null,
            state: null
          }, window.location.origin);
          window.close();
          return;
        }
        
        // Se não há janela pai, redirecionar com erro
        navigate('/dashboard/integrations?error=' + encodeURIComponent(errorMessage));
        return;
      }

      // Verificar se há código de autorização
      if (code && state) {
        // Enviar dados para a janela pai
        if (window.opener) {
          window.opener.postMessage({
            type: 'oauth_callback',
            code,
            state,
            error: null
          }, window.location.origin);
          window.close();
          return;
        }
        
        // Se não há janela pai, redirecionar para integrações
        navigate('/dashboard/integrations?success=true');
        return;
      }

      // Se não há código nem erro, algo deu errado
      console.error('Callback OAuth inválido - sem código nem erro');
      
      if (window.opener) {
        window.opener.postMessage({
          type: 'oauth_callback',
          error: 'Resposta OAuth inválida',
          code: null,
          state: null
        }, window.location.origin);
        window.close();
      } else {
        navigate('/dashboard/integrations?error=invalid_callback');
      }
    };

    // Executar callback após um pequeno delay para garantir que a página carregou
    const timer = setTimeout(handleCallback, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Processando autenticação...
        </h2>
        <p className="text-gray-600">
          Aguarde enquanto finalizamos sua conexão.
        </p>
      </div>
    </div>
  );
}