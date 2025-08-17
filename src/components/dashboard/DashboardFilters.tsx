import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Building2 } from "lucide-react";
import { FilterState } from "@/types/dashboardTypes";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Database } from "@/integrations/supabase/types";

type Client = Database['public']['Tables']['agency_clients']['Row'];

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, [user]);

  const fetchClients = async () => {
    if (!user?.user_metadata?.agency_id) return;
    
    try {
      const { data, error } = await supabase
        .from('agency_clients')
        .select('*')
        .eq('agency_id', user.user_metadata.agency_id)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const getDateRange = (period: string) => {
    const today = new Date();
    const from = new Date();
    
    switch (period) {
      case 'today':
        from.setDate(today.getDate());
        break;
      case '7d':
        from.setDate(today.getDate() - 7);
        break;
      case '30d':
        from.setDate(today.getDate() - 30);
        break;
      case '90d':
        from.setDate(today.getDate() - 90);
        break;
      default:
        from.setDate(today.getDate() - 30);
    }
    
    return {
      from: from.toISOString().split('T')[0],
      to: today.toISOString().split('T')[0]
    };
  };

  const handleDateRangeChange = (period: string) => {
    const dateRange = getDateRange(period);
    onFiltersChange({ ...filters, dateRange });
  };

  return (
    <div className="bg-card border-b border-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filtros</span>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={typeof filters.dateRange === 'string' ? filters.dateRange : '30d'} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <Select value={filters.client} onValueChange={(value) => updateFilter('client', value)} disabled={loading}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={loading ? "Carregando..." : "Todos os Clientes"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Clientes</SelectItem>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Select value={filters.campaign} onValueChange={(value) => updateFilter('campaign', value)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Campanha" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Campanhas</SelectItem>
            <SelectItem value="black-friday">Black Friday</SelectItem>
            <SelectItem value="remarketing">Remarketing</SelectItem>
            <SelectItem value="prospecting">Prospecção</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.source} onValueChange={(value) => updateFilter('source', value)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Origem/Mídia" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as Origens</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="organic">Orgânico</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.device} onValueChange={(value) => updateFilter('device', value)}>
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Dispositivo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="desktop">Desktop</SelectItem>
            <SelectItem value="mobile">Mobile</SelectItem>
            <SelectItem value="tablet">Tablet</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => onFiltersChange({
          dateRange: getDateRange('30d'),
          campaign: 'all',
          source: 'all',
          device: 'all',
          client: 'all'
        })}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}