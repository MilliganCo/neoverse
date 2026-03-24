import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import { Check, Sparkles, Zap } from 'lucide-react';
import { SubscriptionPlan } from '@/types';

const PLANS: { id: SubscriptionPlan; name: string; icon: React.ReactNode; features: string[] }[] = [
  {
    id: 'free',
    name: 'Free',
    icon: <Sparkles className="w-6 h-6" />,
    features: ['1 объект в день', '1 public + 1 private space'],
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: <Zap className="w-6 h-6" />,
    features: ['2 объекта в день', 'Больше пространств', 'Повышенный шанс на редкие'],
  },
  {
    id: 'pro+',
    name: 'Pro+',
    icon: <Sparkles className="w-6 h-6" />,
    features: ['Всё из Pro', 'Magic Finger (игра с чужими пространствами)'],
  },
];

interface PaywallProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerSource?: string;
}

const Paywall: React.FC<PaywallProps> = ({ open, onOpenChange }) => {
  const { user } = useApp();
  const currentPlan = user.subscriptionPlan;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-border/50 rounded-2xl max-w-md p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl">Тарифы</DialogTitle>
          <p className="text-sm text-muted-foreground">Выбери подходящий план</p>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isProPlus = plan.id === 'pro+';

            return (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={cn(
                  'rounded-2xl p-5 border transition-all',
                  isProPlus && 'gradient-border glass-card',
                  isCurrent && 'ring-2 ring-primary',
                  !isProPlus && !isCurrent && 'glass-card border-border/50'
                )}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        isProPlus ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {plan.icon}
                    </div>
                    <div>
                      <p className="font-bold text-lg">{plan.name}</p>
                      {isCurrent && (
                        <Badge variant="secondary" className="text-[10px] mt-1">Текущий</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={isCurrent ? 'outline' : 'default'}
                  className="w-full rounded-xl"
                  disabled={isCurrent}
                  onClick={() => {
                    if (!isCurrent) {
                      // Mock upgrade - would integrate with payments
                      onOpenChange(false);
                    }
                  }}
                >
                  {isCurrent ? 'Текущий план' : 'Upgrade'}
                </Button>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Paywall;
