import { useState } from "react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { PlatformContent } from "@/components/PlatformContent";

const Index = () => {
  const [activePlatform, setActivePlatform] = useState('analytics');
  const [activePage, setActivePage] = useState('Visão Geral');

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        activePlatform={activePlatform}
        activePage={activePage}
        onPlatformChange={setActivePlatform}
        onPageChange={setActivePage}
      />
      <PlatformContent 
        platform={activePlatform}
        page={activePage}
      />
    </div>
  );
};

export default Index;
