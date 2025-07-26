import { MetricCard } from "./MetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp,
  Target,
  DollarSign,
  ShoppingBag,
  Search,
  FileText
} from "lucide-react";

interface PlatformContentProps {
  platform: string;
  page: string;
}

export function PlatformContent({ platform, page }: PlatformContentProps) {
  const renderAnalyticsContent = () => {
    switch (page) {
      case 'Visão Geral':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Usuários"
              value="12,543"
              change="+12.5% vs mês anterior"
              changeType="positive"
              icon={Users}
              color="analytics"
            />
            <MetricCard
              title="Visualizações"
              value="45,231"
              change="+8.2% vs mês anterior"
              changeType="positive"
              icon={Eye}
              color="analytics"
            />
            <MetricCard
              title="Tempo Médio"
              value="2m 34s"
              change="-5.1% vs mês anterior"
              changeType="negative"
              icon={Clock}
              color="analytics"
            />
            <MetricCard
              title="Taxa de Conversão"
              value="3.2%"
              change="+15.3% vs mês anterior"
              changeType="positive"
              icon={TrendingUp}
              color="analytics"
            />
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{page}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conteúdo da página {page} do Google Analytics 4 será implementado aqui.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderMetaContent = () => {
    switch (page) {
      case 'Visão Geral':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Alcance"
              value="85,432"
              change="+18.7% vs mês anterior"
              changeType="positive"
              icon={Target}
              color="meta"
            />
            <MetricCard
              title="Impressões"
              value="234,567"
              change="+22.1% vs mês anterior"
              changeType="positive"
              icon={Eye}
              color="meta"
            />
            <MetricCard
              title="CTR"
              value="2.8%"
              change="+0.5% vs mês anterior"
              changeType="positive"
              icon={TrendingUp}
              color="meta"
            />
            <MetricCard
              title="Gasto"
              value="R$ 3,245"
              change="+12.3% vs mês anterior"
              changeType="neutral"
              icon={DollarSign}
              color="meta"
            />
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{page}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conteúdo da página {page} do Meta Ads será implementado aqui.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderGoogleAdsContent = () => {
    switch (page) {
      case 'Visão Geral':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Cliques"
              value="15,678"
              change="+9.4% vs mês anterior"
              changeType="positive"
              icon={Target}
              color="google"
            />
            <MetricCard
              title="Impressões"
              value="567,890"
              change="+15.2% vs mês anterior"
              changeType="positive"
              icon={Eye}
              color="google"
            />
            <MetricCard
              title="CPC Médio"
              value="R$ 1,25"
              change="-8.1% vs mês anterior"
              changeType="positive"
              icon={DollarSign}
              color="google"
            />
            <MetricCard
              title="Quality Score"
              value="7.8/10"
              change="+0.3 vs mês anterior"
              changeType="positive"
              icon={TrendingUp}
              color="google"
            />
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{page}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conteúdo da página {page} do Google Ads será implementado aqui.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderEcommerceContent = () => {
    switch (page) {
      case 'Visão Geral':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Receita"
              value="R$ 45,678"
              change="+23.5% vs mês anterior"
              changeType="positive"
              icon={DollarSign}
              color="ecommerce"
            />
            <MetricCard
              title="Pedidos"
              value="234"
              change="+17.2% vs mês anterior"
              changeType="positive"
              icon={ShoppingBag}
              color="ecommerce"
            />
            <MetricCard
              title="Ticket Médio"
              value="R$ 195,12"
              change="+5.3% vs mês anterior"
              changeType="positive"
              icon={TrendingUp}
              color="ecommerce"
            />
            <MetricCard
              title="Taxa de Abandono"
              value="67.8%"
              change="-12.1% vs mês anterior"
              changeType="positive"
              icon={Users}
              color="ecommerce"
            />
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{page}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conteúdo da página {page} do E-commerce será implementado aqui.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderSeoContent = () => {
    switch (page) {
      case 'Visão Geral':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Palavras-chave"
              value="1,234"
              change="+45 vs mês anterior"
              changeType="positive"
              icon={Search}
              color="seo"
            />
            <MetricCard
              title="Tráfego Orgânico"
              value="23,456"
              change="+18.9% vs mês anterior"
              changeType="positive"
              icon={TrendingUp}
              color="seo"
            />
            <MetricCard
              title="Posts Publicados"
              value="12"
              change="+3 vs mês anterior"
              changeType="positive"
              icon={FileText}
              color="seo"
            />
            <MetricCard
              title="Posição Média"
              value="8.5"
              change="-1.2 vs mês anterior"
              changeType="positive"
              icon={Target}
              color="seo"
            />
          </div>
        );
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{page}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Conteúdo da página {page} do SEO/Blog será implementado aqui.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const renderContent = () => {
    switch (platform) {
      case 'analytics':
        return renderAnalyticsContent();
      case 'meta':
        return renderMetaContent();
      case 'google-ads':
        return renderGoogleAdsContent();
      case 'ecommerce':
        return renderEcommerceContent();
      case 'seo':
        return renderSeoContent();
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Selecione uma plataforma para visualizar os dados.
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
}