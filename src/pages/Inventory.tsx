import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import Scene3D from '@/components/3d/Scene3D';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { RARITY_LABELS } from '@/data/mockData';
import { Object3D, Rarity } from '@/types';
import { cn } from '@/lib/utils';
import { RotateCcw, X, Plus, Globe, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial } from '@react-three/drei';

const ObjectDetailView: React.FC<{
  obj: Object3D;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spaces?: { id: string; name: string; visibility: string; coverColor: string }[];
  onAddToSpace?: (spaceId: string, obj: Object3D) => void;
}> = ({ obj, open, onOpenChange, spaces = [], onAddToSpace }) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [addToSpaceOpen, setAddToSpaceOpen] = useState(false);

  const handleAddToSpace = (spaceId: string) => {
    onAddToSpace?.(spaceId, obj);
    setAddToSpaceOpen(false);
    onOpenChange(false);
  };

  const renderGeometry = () => {
    switch (obj.geometry) {
      case 'cube': return <boxGeometry args={[1, 1, 1]} />;
      case 'sphere': return <sphereGeometry args={[0.7, 32, 32]} />;
      case 'torus': return <torusGeometry args={[0.5, 0.2, 16, 32]} />;
      case 'cylinder': return <cylinderGeometry args={[0.5, 0.5, 1, 32]} />;
      case 'cone': return <coneGeometry args={[0.5, 1, 32]} />;
      case 'dodecahedron': return <dodecahedronGeometry args={[0.7]} />;
      case 'octahedron': return <octahedronGeometry args={[0.7]} />;
      case 'icosahedron': return <icosahedronGeometry args={[0.7]} />;
      default: return <boxGeometry args={[1, 1, 1]} />;
    }
  };

  return (
    <>
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[85vh] rounded-t-2xl glass-card border-t border-border/50 flex flex-col"
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-left flex items-center justify-between">
            <span>{obj.name}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setAutoRotate(!autoRotate)}
                className="rounded-xl h-9 w-9"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="rounded-xl h-9 w-9"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 min-h-0 relative mt-4">
          <div className="absolute inset-0 rounded-xl overflow-hidden">
            <Canvas camera={{ position: [0, 0, 3], fov: 50 }} gl={{ antialias: true, alpha: true }}>
              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 5, 5]} intensity={0.8} />
              <pointLight position={[-5, -5, -5]} intensity={0.3} color="#8b5cf6" />
              <pointLight position={[5, -5, 5]} intensity={0.3} color="#06b6d4" />
              <mesh scale={obj.scale}>
                {renderGeometry()}
                {obj.type === 'dynamic' ? (
                  <MeshDistortMaterial color={obj.color} distort={0.3} speed={2} roughness={0.2} metalness={0.8} />
                ) : (
                  <meshStandardMaterial color={obj.color} roughness={0.2} metalness={0.8} />
                )}
              </mesh>
              <OrbitControls
                enableZoom={true}
                enablePan={false}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
              />
            </Canvas>
          </div>
        </div>

        <div className="flex-shrink-0 p-4 pt-2 space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge className={`rarity-badge-${obj.rarity} text-xs px-2 py-0.5 rounded-full border-0`}>
              {RARITY_LABELS[obj.rarity]}
            </Badge>
            <Badge variant="outline" className="text-[10px] rounded-full">
              {obj.type === 'dynamic' ? '⚡ Dynamic' : '🧊 Static'}
            </Badge>
            <span className="text-xs text-muted-foreground">Set: {obj.set}</span>
          </div>
          <p className="text-sm text-muted-foreground">{obj.description}</p>
          {onAddToSpace && spaces.length > 0 && (
            <Button
              onClick={() => setAddToSpaceOpen(true)}
              className="w-full mt-2 h-10 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" /> Add to Space
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>

    <Dialog open={addToSpaceOpen} onOpenChange={setAddToSpaceOpen}>
      <DialogContent className="glass-card border-border/50 rounded-2xl max-w-sm">
        <DialogHeader>
          <DialogTitle>Добавить в пространство</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Выбери пространство для {obj.name}
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
    </>
  );
};

const Inventory: React.FC = () => {
  const { inventory, spaces, addObjectToSpace } = useApp();
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [setFilter, setSetFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedObj, setSelectedObj] = useState<Object3D | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const uniqueSets = useMemo(() => {
    const sets = new Set(inventory.map(o => o.set));
    return Array.from(sets).sort();
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(obj => {
      if (rarityFilter !== 'all' && obj.rarity !== rarityFilter) return false;
      if (setFilter !== 'all' && obj.set !== setFilter) return false;
      if (typeFilter !== 'all' && obj.type !== typeFilter) return false;
      return true;
    });
  }, [inventory, rarityFilter, setFilter, typeFilter]);

  const openDetail = (obj: Object3D) => {
    setSelectedObj(obj);
    setDetailOpen(true);
  };

  return (
    <div className="px-4 pt-4 pb-20">
      <h1 className="text-2xl font-bold mb-1">Inventory</h1>
      <p className="text-sm text-muted-foreground mb-4">{filteredInventory.length} объектов</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={rarityFilter} onValueChange={setRarityFilter}>
          <SelectTrigger className="w-[120px] h-9 rounded-xl glass-card border-border/50 text-xs">
            <SelectValue placeholder="Редкость" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {(Object.keys(RARITY_LABELS) as Rarity[]).map(r => (
              <SelectItem key={r} value={r}>{RARITY_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={setFilter} onValueChange={setSetFilter}>
          <SelectTrigger className="w-[120px] h-9 rounded-xl glass-card border-border/50 text-xs">
            <SelectValue placeholder="Сет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            {uniqueSets.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[110px] h-9 rounded-xl glass-card border-border/50 text-xs">
            <SelectValue placeholder="Тип" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="static">Static</SelectItem>
            <SelectItem value="dynamic">Dynamic</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredInventory.map((obj) => (
          <div
            key={obj.id}
            onClick={() => openDetail(obj)}
            className={cn(
              'glass-card rounded-2xl overflow-hidden transition-transform duration-200 hover:scale-[1.02] cursor-pointer'
            )}
          >
            <div className="h-32 w-full">
              <Scene3D geometry={obj.geometry} color={obj.color} scale={[0.8, 0.8, 0.8]} autoRotate />
            </div>
            <div className="p-3">
              <p className="text-sm font-semibold truncate">{obj.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-muted-foreground">{obj.set}</span>
                <Badge className={`rarity-badge-${obj.rarity} text-[9px] px-1.5 py-0 rounded-full border-0`}>
                  {RARITY_LABELS[obj.rarity]}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedObj && (
        <ObjectDetailView
          obj={selectedObj}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          spaces={spaces}
          onAddToSpace={addObjectToSpace}
        />
      )}
    </div>
  );
};

export default Inventory;
