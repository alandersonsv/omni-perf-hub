import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PlatformContent } from "@/components/PlatformContent";
import { DashboardFilters } from "@/components/dashboard/DashboardFilters";
import { FilterState } from "@/types/dashboardTypes";

const Index = () => {
  const [activePlatform, setActivePlatform] = useState('meta');
  const [activePage, setActivePage] = useState('KPIs Principais & Funil');
  const [filters, setFilters] = useState<FilterState>({
    dateRange: '30d',
    campaign: 'all',
    source: 'all',
    device: 'all'
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        activePlatform={activePlatform}
        activePage={activePage}
        onPlatformChange={setActivePlatform}
        onPageChange={setActivePage}
      />
      <DashboardFilters 
        filters={filters}
        onFiltersChange={setFilters}
      />
      <PlatformContent 
        platform={activePlatform}
        page={activePage}
        filters={filters}
      />
    </div>
  );
};

export default Index;
