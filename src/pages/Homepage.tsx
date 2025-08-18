import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Clock, 
  Target, 
  Eye, 
  CheckCircle, 
  Star,
  ArrowRight,
  Play,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';

export default function Homepage() {
  const navigate = useNavigate();
  
  const handleLogin = () => {
    navigate('/login');
  };
  
  const handleRegister = () => {
    navigate('/register');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Metrionix
              </span>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="#beneficios" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Benefícios
              </a>
              <a href="#funcionalidades" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Funcionalidades
              </a>
              <a href="#clientes" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Clientes
              </a>
              <a href="#precos" className="text-gray-700 hover:text-orange-600 font-medium transition-colors">
                Planos e Preços
              </a>
            </nav>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-medium px-4"
                onClick={handleLogin}
              >
                Login
              </Button>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4"
                onClick={handleRegister}
              >
                Criar Conta
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                  🚀 Plataforma #1 para Agências de Marketing
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Unifique os dados dos seus clientes. 
                  <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                    Crie dashboards inteligentes
                  </span> em minutos.
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Metrionix é a plataforma definitiva para agências que buscam eficiência. 
                  Conecte as contas dos seus clientes em um só lugar e economize horas de trabalho operacional.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg">
                  <Play className="mr-2 h-5 w-5" />
                  Testar por 14 dias
                </Button>
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg">
                  Ver demonstração
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Sem cartão de crédito</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Configuração em 5 minutos</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Suporte 24/7</span>
                </div>
              </div>
            </div>
            
            {/* Dashboard Mockup */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                {/* Dashboard Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="text-sm text-gray-500">Dashboard - Cliente ABC</div>
                  </div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Metrics Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">R$ 45.2K</div>
                      <div className="text-sm text-blue-500">Receita Total</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12.5%
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">2.8K</div>
                      <div className="text-sm text-green-500">Conversões</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8.3%
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">4.2%</div>
                      <div className="text-sm text-purple-500">CTR Médio</div>
                      <div className="text-xs text-green-600 flex items-center mt-1">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +0.8%
                      </div>
                    </div>
                  </div>
                  
                  {/* Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-6 h-32 flex items-center justify-center">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <BarChart3 className="h-8 w-8" />
                      <span className="text-sm">Gráfico de Performance</span>
                    </div>
                  </div>
                  
                  {/* Integration Status */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Integrações Ativas:</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">G</div>
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">A</div>
                      <div className="w-6 h-6 bg-blue-400 rounded flex items-center justify-center text-white text-xs font-bold">M</div>
                      <div className="text-xs text-green-600">✓ Sincronizado</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-orange-500 text-white p-3 rounded-full shadow-lg">
                <Zap className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-green-500 text-white p-3 rounded-full shadow-lg">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-gray-600 font-medium">Agências que já confiam na Metrionix</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center opacity-60">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-center h-16">
                <div className="text-gray-400 font-bold">LOGO {i}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="funcionalidades" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Como funciona a <span className="text-orange-500">Metrionix</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Em apenas 3 passos simples, você conecta todas as contas dos seus clientes 
              e cria dashboards profissionais que impressionam.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Passo 1 - Conexão */}
            <Card className="relative overflow-hidden border-2 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="h-8 w-8 text-orange-600" />
                </div>
                <Badge className="bg-orange-500 text-white mb-2">Passo 1</Badge>
                <CardTitle className="text-xl">Conecte as Plataformas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  Conecte Google Ads, Analytics, Search Console e Meta Ads com apenas alguns cliques. 
                  OAuth seguro e configuração automática.
                </p>
                
                {/* Visual de Conexão */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">G</div>
                      <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">A</div>
                    </div>
                    <div className="flex flex-col space-y-1">
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                      <ArrowRight className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">M</div>
                      <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">S</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passo 2 - Configuração */}
            <Card className="relative overflow-hidden border-2 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-orange-600" />
                </div>
                <Badge className="bg-orange-500 text-white mb-2">Passo 2</Badge>
                <CardTitle className="text-xl">Configure Dashboards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  Selecione métricas, defina períodos e personalize visualizações. 
                  Interface drag-and-drop intuitiva.
                </p>
                
                {/* Visual de Configuração */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Métricas Selecionadas:</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">CTR</div>
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Conversões</div>
                      <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">ROAS</div>
                      <div className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded">CPC</div>
                    </div>
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded p-2 text-center text-xs text-gray-500">
                      Arraste widgets aqui
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Passo 3 - Resultado */}
            <Card className="relative overflow-hidden border-2 hover:border-orange-200 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-orange-600" />
                </div>
                <Badge className="bg-orange-500 text-white mb-2">Passo 3</Badge>
                <CardTitle className="text-xl">Compartilhe Resultados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-center">
                  Dashboards profissionais prontos para apresentar aos clientes. 
                  Atualizações automáticas em tempo real.
                </p>
                
                {/* Visual do Dashboard Final */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="bg-white rounded p-2 shadow-sm">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Performance Geral</span>
                        <span className="text-green-600 font-semibold">+15.2%</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-white rounded p-2 shadow-sm text-center">
                        <div className="text-lg font-bold text-blue-600">2.4K</div>
                        <div className="text-xs text-gray-500">Cliques</div>
                      </div>
                      <div className="bg-white rounded p-2 shadow-sm text-center">
                        <div className="text-lg font-bold text-green-600">R$ 12K</div>
                        <div className="text-xs text-gray-500">Receita</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <Monitor className="h-3 w-3" />
                      <Smartphone className="h-3 w-3" />
                      <span>Responsivo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Por que escolher a <span className="text-orange-500">Metrionix</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transforme sua agência com a plataforma que realmente entende as necessidades 
              do mercado de marketing digital.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Benefício 1 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl mb-2">Ganhe tempo para o que importa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Automatize a coleta de dados e foque na estratégia. Economize até 15 horas 
                  por semana em tarefas operacionais.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-2 text-orange-700">
                    <Zap className="h-4 w-4" />
                    <span className="text-sm font-medium">Alertas Automáticos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefício 2 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl mb-2">Aumente a transparência e o valor percebido</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Entregue dashboards profissionais que seus clientes entendem e usam. 
                  Aumente o LTV em até 40%.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-2 text-orange-700">
                    <BarChart3 className="h-4 w-4" />
                    <span className="text-sm font-medium">Templates Profissionais</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefício 3 */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-orange-600" />
                </div>
                <CardTitle className="text-xl mb-2">Visão 360º de cada cliente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Monitore performance de anúncios, tráfego do site e resultados de SEO 
                  em uma única tela.
                </p>
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-center space-x-2 text-orange-700">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm font-medium">Dados Unificados</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section id="clientes" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              O que nossos clientes dizem sobre a Metrionix
            </h2>
            <div className="flex items-center justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600 font-medium">4.9/5 (127 avaliações)</span>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Depoimento 1 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "A Metrionix revolucionou nossa operação. Conseguimos reduzir o tempo de 
                  criação de relatórios de 8 horas para 30 minutos. Nossos clientes adoram 
                  a transparência dos dashboards."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Maria Clara</div>
                    <div className="text-sm text-gray-500">CEO, Digital Growth Agency</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 2 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "Implementamos a Metrionix em 3 dias e já vimos resultados. A integração 
                  com Google Ads e Analytics é perfeita. Recomendo para qualquer agência 
                  que quer escalar."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                    RS
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Roberto Silva</div>
                    <div className="text-sm text-gray-500">Diretor, Performance Marketing Co.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 3 */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "O ROI foi imediato. Conseguimos aumentar nossa margem de lucro em 25% 
                  só pela eficiência operacional. A Metrionix é indispensável para nossa 
                  operação."
                </p>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    AF
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Ana Ferreira</div>
                    <div className="text-sm text-gray-500">Fundadora, Ads Expert</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Planos e Preços */}
      <section id="precos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Escolha o plano ideal para sua operação crescer
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comece gratuitamente e escale conforme sua agência cresce. 
              Todos os planos incluem 14 dias de teste gratuito.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Plano Starter */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Starter</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  R$ 197
                  <span className="text-lg font-normal text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600">Perfeito para agências iniciantes</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Até 5 clientes</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Google Ads + Analytics</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Dashboards básicos</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Suporte por email</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-600 hover:bg-gray-700 text-white">
                  Iniciar teste de 14 dias
                </Button>
              </CardContent>
            </Card>

            {/* Plano Professional - Recomendado */}
            <Card className="relative border-2 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-orange-500 text-white px-4 py-1">
                  Mais Popular
                </Badge>
              </div>
              <CardHeader className="text-center pt-8">
                <CardTitle className="text-2xl mb-2">Professional</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  R$ 497
                  <span className="text-lg font-normal text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600">Ideal para agências em crescimento</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Até 25 clientes</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Todas as integrações</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Dashboards avançados</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Relatórios automatizados</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Suporte prioritário</span>
                  </li>
                </ul>
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Iniciar teste de 14 dias
                </Button>
              </CardContent>
            </Card>

            {/* Plano Enterprise */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  R$ 997
                  <span className="text-lg font-normal text-gray-500">/mês</span>
                </div>
                <p className="text-gray-600">Para agências estabelecidas</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Clientes ilimitados</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>White-label completo</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>API personalizada</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Gerente de conta dedicado</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Suporte 24/7</span>
                  </li>
                </ul>
                <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                  Iniciar teste de 14 dias
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Teste com 14 dias de garantia!
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Não perca mais tempo com planilhas e relatórios manuais. 
            Comece hoje mesmo e veja a diferença em sua operação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-50 font-semibold px-8 py-4 text-lg">
              <Play className="mr-2 h-5 w-5" />
              Quero testar por 14 dias
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-orange-600 px-8 py-4 text-lg">
              Falar com especialista
            </Button>
          </div>
          <p className="text-orange-100 text-sm mt-4">
            ✓ Sem cartão de crédito ✓ Configuração em 5 minutos ✓ Cancelamento a qualquer momento
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-xl text-gray-600">
              Tire suas dúvidas sobre a Metrionix
            </p>
          </div>
          
          <div className="space-y-6">
            {[
              {
                question: "Quanto tempo leva para configurar a Metrionix?",
                answer: "A configuração inicial leva apenas 5 minutos. Você conecta suas contas através do OAuth seguro e os dados começam a ser sincronizados automaticamente."
              },
              {
                question: "Posso cancelar a qualquer momento?",
                answer: "Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais. Seus dados ficam disponíveis por 30 dias após o cancelamento."
              },
              {
                question: "A Metrionix funciona com outras plataformas além do Google?",
                answer: "Sim! Integramos com Google Ads, Google Analytics, Search Console, Meta Ads (Facebook/Instagram) e estamos constantemente adicionando novas integrações."
              },
              {
                question: "Os dados dos meus clientes ficam seguros?",
                answer: "Absolutamente. Utilizamos criptografia de ponta a ponta, OAuth 2.0 para autenticação e seguimos todas as normas LGPD e GDPR. Seus dados nunca são compartilhados."
              },
              {
                question: "Posso personalizar os dashboards com minha marca?",
                answer: "Sim! Nos planos Professional e Enterprise você pode personalizar cores, logos e até mesmo usar um domínio próprio (white-label completo)."
              }
            ].map((faq, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-gray-900 group-open:text-orange-600">
                        {faq.question}
                      </h3>
                      <ArrowRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-4 text-gray-600">
                      {faq.answer}
                    </div>
                  </details>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold">Metrionix</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                A plataforma definitiva para agências que buscam eficiência e resultados. 
                Unifique dados, crie dashboards e impressione seus clientes.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 cursor-pointer">
                  <span className="text-sm font-bold">@</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrações</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Metrionix. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-sm text-gray-400 mt-4 md:mt-0">
              <a href="/legal/privacy-policy-2025-confidential" className="hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <a href="/legal/terms-of-service-2025-confidential" className="hover:text-white transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}