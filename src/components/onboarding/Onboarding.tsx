import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AVATAR_PRESETS } from '@/data/mockData';
import { useApp } from '@/context/AppContext';
import Scene3D from '@/components/3d/Scene3D';
import { ArrowRight, Sparkles } from 'lucide-react';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const [nickname, setNickname] = useState('');
  const [avatarIndex, setAvatarIndex] = useState(0);
  const { completeOnboarding } = useApp();

  const handleFinish = () => {
    if (nickname.trim()) {
      completeOnboarding(nickname.trim(), avatarIndex);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Gradient background orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-glow-purple/20 blur-[120px] animate-pulse-glow" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-glow-blue/20 blur-[120px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-glow-pink/10 blur-[100px] animate-pulse-glow" style={{ animationDelay: '0.5s' }} />
      </div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm"
          >
            <div className="w-48 h-48 mb-8">
              <Scene3D geometry="cube" color="#8b5cf6" distort autoRotate />
            </div>
            <h1 className="text-3xl font-bold mb-3 gradient-text">3D Spaces</h1>
            <p className="text-muted-foreground text-lg mb-2">Каждый день — новый 3D-объект</p>
            <p className="text-muted-foreground/70 text-sm mb-8">Собирай, создавай пространства, делись с миром</p>
            <Button
              onClick={() => setStep(1)}
              className="w-full h-12 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90"
            >
              Начать <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full"
          >
            <Sparkles className="w-10 h-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Кто ты?</h2>
            <p className="text-muted-foreground text-sm mb-6">Выбери никнейм и аватар</p>
            
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Твой никнейм..."
              className="mb-6 h-12 text-center text-lg glass-card border-border/50 rounded-xl"
              maxLength={20}
            />

            <div className="flex gap-3 mb-8 flex-wrap justify-center">
              {AVATAR_PRESETS.map((avatar, idx) => (
                <button
                  key={idx}
                  onClick={() => setAvatarIndex(idx)}
                  className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-200 glass-card',
                    idx === avatarIndex 
                      ? 'ring-2 ring-primary scale-110 glow-purple' 
                      : 'hover:scale-105 opacity-70'
                  )}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>

            <Button
              onClick={() => nickname.trim() && setStep(2)}
              disabled={!nickname.trim()}
              className="w-full h-12 text-base font-semibold rounded-xl"
            >
              Далее <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm"
          >
            <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center text-3xl mb-4">
              {AVATAR_PRESETS[avatarIndex].emoji}
            </div>
            <h2 className="text-2xl font-bold mb-2">Привет, {nickname}!</h2>
            <p className="text-muted-foreground text-sm mb-4">Мы создали для тебя 2 пространства</p>

            <div className="w-full space-y-3 mb-8">
              <div className="glass-card rounded-xl p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">🔒</div>
                  <div>
                    <p className="font-semibold text-sm">My Private Room</p>
                    <p className="text-xs text-muted-foreground">Только для тебя</p>
                  </div>
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">🌍</div>
                  <div>
                    <p className="font-semibold text-sm">Public Gallery</p>
                    <p className="text-xs text-muted-foreground">Видно всем</p>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handleFinish}
              className="w-full h-12 text-base font-semibold rounded-xl"
            >
              Получить первый дроп! <Sparkles className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step indicators */}
      <div className="absolute bottom-8 flex gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === step ? 'w-8 bg-primary' : 'w-1.5 bg-muted-foreground/30'
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
