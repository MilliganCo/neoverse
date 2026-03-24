import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AVATAR_PRESETS } from '@/data/mockData';
import { Settings, Moon, Sun, ShoppingBag, Award, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Paywall from '@/components/paywall/Paywall';

const Profile: React.FC = () => {
  const { user, inventory, spaces, theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const [paywallOpen, setPaywallOpen] = useState(false);

  const publicSpaces = spaces.filter(s => s.visibility === 'public');

  return (
    <div className="px-4 pt-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-xl">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* User card */}
      <div className="glass-card rounded-2xl p-5 mb-6 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-3xl">
          {AVATAR_PRESETS[user.avatarIndex]?.emoji}
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold">{user.nickname || 'User'}</h2>
          <p className="text-xs text-muted-foreground">
            {user.subscriptionPlan === 'free' ? 'Free Plan' : user.subscriptionPlan === 'pro' ? 'Pro' : 'Pro+'}
          </p>
        </div>
        {user.subscriptionPlan === 'free' && (
          <Button size="sm" onClick={() => setPaywallOpen(true)} className="rounded-xl">
            Upgrade
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{inventory.length}</p>
          <p className="text-[10px] text-muted-foreground">Objects</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{publicSpaces.length}</p>
          <p className="text-[10px] text-muted-foreground">Public Spaces</p>
        </div>
        <div className="glass-card rounded-xl p-3 text-center">
          <p className="text-lg font-bold">{spaces.reduce((sum, s) => sum + s.likes, 0)}</p>
          <p className="text-[10px] text-muted-foreground">Total Likes</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="space-y-2">
        <button
          onClick={() => navigate('/market')}
          className="glass-card rounded-xl p-4 w-full flex items-center gap-3 text-left hover:bg-muted/10 transition-colors"
        >
          <ShoppingBag className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Market</p>
            <p className="text-xs text-muted-foreground">Покупай и продавай</p>
          </div>
        </button>
        <button className="glass-card rounded-xl p-4 w-full flex items-center gap-3 text-left hover:bg-muted/10 transition-colors">
          <Award className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Achievements</p>
            <p className="text-xs text-muted-foreground">3 из 12 получено</p>
          </div>
        </button>
        <button className="glass-card rounded-xl p-4 w-full flex items-center gap-3 text-left hover:bg-muted/10 transition-colors">
          <BarChart3 className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">Statistics</p>
            <p className="text-xs text-muted-foreground">Подробная аналитика</p>
          </div>
        </button>
      </div>

      <Paywall open={paywallOpen} onOpenChange={setPaywallOpen} />
    </div>
  );
};

export default Profile;
