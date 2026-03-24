import React from 'react';
import { useApp } from '@/context/AppContext';
import { Heart, Star, Flame, Gem, Trophy } from 'lucide-react';
import { MOCK_LEADERBOARD, MOCK_SPACES, AVATAR_PRESETS } from '@/data/mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const Explore: React.FC = () => {
  const publicSpaces = MOCK_SPACES.filter(s => s.visibility === 'public');

  return (
    <div className="px-4 pt-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Explore</h1>

      {/* Public spaces feed */}
      <div className="space-y-3 mb-8">
        {publicSpaces.map((space) => (
          <div
            key={space.id}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
          >
            <div
              className="h-36 w-full"
              style={{ background: `linear-gradient(135deg, ${space.coverColor}dd, ${space.coverColor}44)` }}
            />
            <div className="p-4">
              <p className="font-semibold mb-2">{space.name}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-yellow-400 transition-colors">
                  <Star className="w-4 h-4" /> {space.rating}
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-red-400 transition-colors">
                  <Flame className="w-4 h-4" /> {space.likes}
                </button>
                <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-blue-400 transition-colors">
                  <Gem className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Leaderboard */}
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Leaderboard</h2>
      </div>

      <Tabs defaultValue="weekly">
        <TabsList className="glass-card mb-3 rounded-xl">
          <TabsTrigger value="daily" className="rounded-lg text-xs">Daily</TabsTrigger>
          <TabsTrigger value="weekly" className="rounded-lg text-xs">Weekly</TabsTrigger>
          <TabsTrigger value="alltime" className="rounded-lg text-xs">All-time</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-2">
          {renderLeaderboard()}
        </TabsContent>
        <TabsContent value="weekly" className="space-y-2">
          {renderLeaderboard()}
        </TabsContent>
        <TabsContent value="alltime" className="space-y-2">
          {renderLeaderboard()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

function renderLeaderboard() {
  return MOCK_LEADERBOARD.map((entry) => (
    <div key={entry.rank} className={cn(
      'glass-card rounded-xl p-3 flex items-center gap-3',
      entry.rank <= 3 && 'gradient-border'
    )}>
      <span className={cn(
        'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold',
        entry.rank === 1 && 'bg-yellow-500/20 text-yellow-400',
        entry.rank === 2 && 'bg-gray-400/20 text-gray-300',
        entry.rank === 3 && 'bg-amber-700/20 text-amber-600',
        entry.rank > 3 && 'bg-muted text-muted-foreground'
      )}>
        {entry.rank}
      </span>
      <div className="w-8 h-8 rounded-full glass-card flex items-center justify-center text-lg">
        {AVATAR_PRESETS[entry.avatarIndex]?.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{entry.nickname}</p>
        <p className="text-xs text-muted-foreground truncate">{entry.spaceName}</p>
      </div>
      <div className="flex items-center gap-1 text-sm">
        <Star className="w-3 h-3 text-yellow-400" />
        <span className="font-semibold">{entry.rating}</span>
      </div>
    </div>
  ));
}

export default Explore;
