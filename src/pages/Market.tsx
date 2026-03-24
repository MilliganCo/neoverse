import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Market: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center gap-4 p-4 border-b border-border/50 glass-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="rounded-xl"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold">Market</h1>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <p className="text-muted-foreground">Market — будет реализован в следующем этапе</p>
      </div>
    </div>
  );
};

export default Market;
