import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import BottomTabBar, { TabId } from '@/components/layout/BottomTabBar';
import Onboarding from '@/components/onboarding/Onboarding';
import DailyDrop from '@/pages/DailyDrop';
import Inventory from '@/pages/Inventory';
import Spaces from '@/pages/Spaces';
import Explore from '@/pages/Explore';
import Profile from '@/pages/Profile';
import { ScrollArea } from '@/components/ui/scroll-area';

const AppContent: React.FC = () => {
  const { user } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('drop');

  if (!user.onboardingComplete) {
    return <Onboarding />;
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'drop': return <DailyDrop />;
      case 'inventory': return <Inventory />;
      case 'spaces': return <Spaces />;
      case 'explore': return <Explore />;
      case 'profile': return <Profile />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        {renderTab()}
      </ScrollArea>
      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const Index: React.FC = () => {
  return <AppContent />;
};

export default Index;
