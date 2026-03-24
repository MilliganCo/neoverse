import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import Scene3D from '@/components/3d/Scene3D';
import { RARITY_LABELS } from '@/data/mockData';
import { Plus, RotateCcw, Share2, Clock, Sparkles, Globe, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const DailyDrop: React.FC = () => {
  const { currentDrop, claimDailyDrop, addObjectToSpace, user, spaces } = useApp();
  const [revealed, setRevealed] = useState(false);
  const [inspecting, setInspecting] = useState(false);
  const [addToSpaceOpen, setAddToSpaceOpen] = useState(false);

  const handleAddToSpace = (spaceId: string) => {
    if (currentDrop) {
      addObjectToSpace(spaceId, currentDrop);
      claimDailyDrop();
      setAddToSpaceOpen(false);
    }
  };

  if (!currentDrop) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <Clock className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h2 className="text-xl font-bold mb-2">Дроп получен!</h2>
        <p className="text-muted-foreground text-sm">Завтра тебя ждёт новый 3D-объект</p>
      </div>
    );
  }

  if (user.dailyDropClaimed) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">Объект в инвентаре!</h2>
        <p className="text-muted-foreground text-sm mb-1">{currentDrop.name} добавлен в коллекцию</p>
        <p className="text-muted-foreground/60 text-xs flex items-center gap-1 mt-4">
          <Clock className="w-3 h-3" /> Завтра будет новый дроп
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] animate-pulse-glow"
          style={{ backgroundColor: `${currentDrop.color}33` }} />
      </div>

      {/* 3D Scene */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.div
              key="capsule"
              className="w-full h-full flex flex-col items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
            >
              <div className="w-40 h-40 mb-6">
                <Scene3D geometry="icosahedron" color="#8b5cf6" distort autoRotate />
              </div>
              <h2 className="text-xl font-bold mb-2">Daily Drop</h2>
              <p className="text-muted-foreground text-sm mb-6">Нажми чтобы раскрыть</p>
              <Button
                onClick={() => {
                  setRevealed(true);
                }}
                className="h-12 px-8 text-base font-semibold rounded-xl glow-purple"
              >
                <Sparkles className="mr-2 w-5 h-5" /> Раскрыть!
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="revealed"
              className="w-full h-full flex flex-col items-center pt-8 relative"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
            >
              {/* Reveal flash effect */}
              <motion.div
                className="absolute inset-0 pointer-events-none z-0"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${currentDrop.color}40 0%, transparent 70%)`,
                  backdropFilter: 'blur(0px)',
                }}
              />
              {/* Particle burst */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 pointer-events-none z-0">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/60"
                    style={{
                      left: '50%',
                      top: '50%',
                      marginLeft: -4,
                      marginTop: -4,
                    }}
                    initial={{ scale: 0, opacity: 1 }}
                    animate={{
                      scale: 1,
                      opacity: 0,
                      x: Math.cos((i / 12) * Math.PI * 2) * 80,
                      y: Math.sin((i / 12) * Math.PI * 2) * 80,
                    }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  />
                ))}
              </div>
              <div className={cn('w-56 h-56 mb-4', inspecting && 'w-72 h-72')}>
                <Scene3D
                  geometry={currentDrop.geometry}
                  color={currentDrop.color}
                  scale={currentDrop.scale}
                  autoRotate
                  distort={currentDrop.type === 'dynamic'}
                />
              </div>

              {/* Object card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-card rounded-2xl p-5 mx-6 w-full max-w-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-bold">{currentDrop.name}</h3>
                  <Badge className={`rarity-badge-${currentDrop.rarity} text-xs px-2 py-0.5 rounded-full border-0`}>
                    {RARITY_LABELS[currentDrop.rarity]}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">Set: {currentDrop.set}</p>
                <p className="text-xs text-muted-foreground mb-3">{currentDrop.description}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="outline" className="text-[10px] rounded-full">
                    {currentDrop.type === 'dynamic' ? '⚡ Dynamic' : '🧊 Static'}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => setAddToSpaceOpen(true)}
                    className="flex-1 h-10 rounded-xl text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add to Space
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setInspecting(!inspecting)}
                    className="h-10 rounded-xl text-sm glass-card border-border/50"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 rounded-xl text-sm glass-card border-border/50"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add to Space dialog */}
      <Dialog open={addToSpaceOpen} onOpenChange={setAddToSpaceOpen}>
        <DialogContent className="glass-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Добавить в пространство</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Выбери пространство для {currentDrop?.name}
          </p>
          <div className="space-y-2">
            {spaces.map((space) => (
              <button
                key={space.id}
                onClick={() => handleAddToSpace(space.id)}
                className="w-full glass-card rounded-xl p-4 flex items-center gap-3 text-left hover:bg-muted/20 transition-colors border border-border/50"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${space.coverColor}33` }}
                >
                  {space.visibility === 'public' ? (
                    <Globe className="w-5 h-5" style={{ color: space.coverColor }} />
                  ) : (
                    <Lock className="w-5 h-5" style={{ color: space.coverColor }} />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-sm">{space.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {space.visibility === 'public' ? 'Публичное' : 'Приватное'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom hint */}
      {revealed && !user.dailyDropClaimed && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-muted-foreground/50 pb-20 flex items-center justify-center gap-1"
        >
          <Clock className="w-3 h-3" /> Завтра будет новый дроп
        </motion.p>
      )}
    </div>
  );
};

export default DailyDrop;
