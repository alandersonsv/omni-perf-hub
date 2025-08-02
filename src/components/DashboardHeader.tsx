import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  Facebook, 
  Chrome, 
  ShoppingCart, 
  Search 
} from "lucide-react";

const platforms = [
  {
    id: 'meta',
    name: 'Meta Ads',
    icon: Facebook,
    color: 'meta',
    pages: ['KPIs Principais & Funil', 'Dados Demográficos', 'Nível de Anúncio']
  },
  {
    id: 'google-ads',
    name: 'Google Ads',
    icon: Chrome,
    color: 'google',
    pages: ['KPIs e Funil', 'Demografia', 'Palavras-chave']
  },
  {
    id: 'analytics',
    name: 'GA4',
    icon: BarChart3,
    color: 'analytics',
    pages: ['KPIs de Engajamento', 'Público', 'Landing Pages']
  },
  {
    id: 'seo',
    name: 'SEO / Blog',
    icon: Search,
    color: 'seo',
    pages: ['KPIs', 'Conteúdo/Blog']
  },
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: ShoppingCart,
    color: 'ecommerce',
    pages: ['KPIs de Ecommerce', 'Funil de Ecommerce', 'Produto/Categoria']
  }
];

interface DashboardHeaderProps {
  activePlatform: string;
  activePage: string;
  onPlatformChange: (platformId: string) => void;
  onPageChange: (page: string) => void;
}

export function DashboardHeader({ 
  activePlatform, 
  activePage, 
  onPlatformChange, 
  onPageChange 
}: DashboardHeaderProps) {
  const currentPlatform = platforms.find(p => p.id === activePlatform);

  return (
    <div className="bg-card border-b border-border">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              📊 Painel de Performance Integrado
            </h1>
            <p className="text-muted-foreground mt-1">
              Análise centralizada de todas as suas plataformas digitais
            </p>
          </div>
        </div>

        {/* Platform Navigation */}
        <div className="flex flex-wrap gap-2 mb-4">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            const isActive = platform.id === activePlatform;
            
            return (
              <Button
                key={platform.id}
                variant={isActive ? "default" : "outline"}
                className={`h-12 px-4 ${
                  isActive 
                    ? `bg-${platform.color} hover:bg-${platform.color}/90 text-white border-${platform.color}` 
                    : `hover:bg-${platform.color}/10 hover:border-${platform.color}/20`
                }`}
                onClick={() => {
                  onPlatformChange(platform.id);
                  onPageChange(platform.pages[0]);
                }}
              >
                <Icon className="w-4 h-4 mr-2" />
                {platform.name}
              </Button>
            );
          })}
        </div>

        {/* Page Navigation */}
        {currentPlatform && (
          <div className="flex flex-wrap gap-2">
            {currentPlatform.pages.map((page) => (
              <Button
                key={page}
                variant={page === activePage ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={
                  page === activePage 
                    ? "bg-secondary/80 text-secondary-foreground" 
                    : "hover:bg-secondary/50"
                }
              >
                {page}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}