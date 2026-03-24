import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Heart, Star, ShoppingBag, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Paywall from '@/components/paywall/Paywall';
import { cn } from '@/lib/utils';
import { SpaceVisibility } from '@/types';

const Spaces: React.FC = () => {
  const { spaces, user, createSpace } = useApp();
  const navigate = useNavigate();
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'public' | 'private'>('all');
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceVisibility, setNewSpaceVisibility] = useState<SpaceVisibility>('private');

  const displayedSpaces = useMemo(() => {
    let filtered = spaces;
    if (visibilityFilter === 'public') filtered = spaces.filter(s => s.visibility === 'public');
    if (visibilityFilter === 'private') filtered = spaces.filter(s => s.visibility === 'private');

    if (user.subscriptionPlan === 'free') {
      const publicSpaces = filtered.filter(s => s.visibility === 'public');
      const privateSpaces = filtered.filter(s => s.visibility === 'private');
      const limited: typeof filtered = [];
      if (visibilityFilter !== 'private' && publicSpaces.length > 0) limited.push(publicSpaces[0]);
      if (visibilityFilter !== 'public' && privateSpaces.length > 0) limited.push(privateSpaces[0]);
      return limited;
    }
    return filtered;
  }, [spaces, visibilityFilter, user.subscriptionPlan]);

  const handleAddSpace = () => {
    if (user.subscriptionPlan === 'free') {
      setPaywallOpen(true);
    } else {
      setCreateOpen(true);
    }
  };

  const handleCreateSpace = () => {
    const name = newSpaceName.trim() || 'New Space';
    const spaceId = createSpace(name, newSpaceVisibility);
    setCreateOpen(false);
    setNewSpaceName('');
    setNewSpaceVisibility('private');
    navigate(`/space/${spaceId}`);
  };

  return (
    <div className="px-4 pt-4 pb-20">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Spaces</h1>
          <p className="text-sm text-muted-foreground">{displayedSpaces.length} пространств</p>
        </div>
        <Button
          size="icon"
          className="rounded-xl h-10 w-10"
          onClick={handleAddSpace}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <Tabs value={visibilityFilter} onValueChange={(v) => setVisibilityFilter(v as typeof visibilityFilter)} className="mb-4">
        <TabsList className="glass-card rounded-xl w-full grid grid-cols-3">
          <TabsTrigger value="all" className="rounded-lg text-xs">Все</TabsTrigger>
          <TabsTrigger value="public" className="rounded-lg text-xs">Public</TabsTrigger>
          <TabsTrigger value="private" className="rounded-lg text-xs">Private</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-2 gap-3">
        {displayedSpaces.map((space) => (
          <div
            key={space.id}
            onClick={() => navigate(`/space/${space.id}`)}
            className="glass-card rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
          >
            <div
              className="h-28 w-full relative"
              style={{ background: `linear-gradient(135deg, ${space.coverColor}cc, ${space.coverColor}66)` }}
            >
              {space.onSale && (
                <Badge className="absolute top-2 right-2 text-[9px] px-1.5 py-0 rounded-full bg-primary/80 border-0">
                  <ShoppingBag className="w-2.5 h-2.5 mr-0.5" /> On sale
                </Badge>
              )}
              <div className={cn(
                'absolute top-2 left-2 text-[9px] px-1.5 py-0.5 rounded-full glass-card',
                space.visibility === 'private' ? 'text-muted-foreground' : 'text-accent'
              )}>
                {space.visibility === 'private' ? '🔒' : '🌍'} {space.visibility}
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold truncate mb-1">{space.name}</p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-0.5">
                  <Heart className="w-3 h-3" /> {space.likes}
                </span>
                <span className="flex items-center gap-0.5">
                  <Star className="w-3 h-3" /> {space.rating}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Paywall open={paywallOpen} onOpenChange={setPaywallOpen} />

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="glass-card border-border/50 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Новое пространство</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Название</label>
              <Input
                value={newSpaceName}
                onChange={(e) => setNewSpaceName(e.target.value)}
                placeholder="Моё пространство"
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Видимость</label>
              <Tabs value={newSpaceVisibility} onValueChange={(v) => setNewSpaceVisibility(v as SpaceVisibility)}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="private">Private</TabsTrigger>
                  <TabsTrigger value="public">Public</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <Button onClick={handleCreateSpace} className="w-full rounded-xl">
            Создать
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Spaces;
