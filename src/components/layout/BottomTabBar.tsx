import React from 'react';
import { Box, Layers, Compass, Globe, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TabId = 'drop' | 'inventory' | 'spaces' | 'explore' | 'profile';

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'drop', label: 'Drop', icon: Box },
  { id: 'inventory', label: 'Inventory', icon: Layers },
  { id: 'spaces', label: 'Spaces', icon: Compass },
  { id: 'explore', label: 'Explore', icon: Globe },
  { id: 'profile', label: 'Profile', icon: User },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border/50">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-all duration-200',
                isActive ? 'text-primary scale-105' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-xl transition-all duration-200',
                isActive && 'bg-primary/10'
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
              {isActive && (
                <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
