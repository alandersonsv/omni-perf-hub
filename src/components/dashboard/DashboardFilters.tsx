import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter } from "lucide-react";
import { FilterState } from "@/types/dashboardTypes";

interface DashboardFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function DashboardFilters({ filters, onFiltersChange }: DashboardFiltersProps) {
  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
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
          <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="7d">7 dias</SelectItem>
              <SelectItem value="30d">30 dias</SelectItem>
              <SelectItem value="90d">90 dias</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
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
          dateRange: '30d',
          campaign: 'all',
          source: 'all',
          device: 'all'
        })}>
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}