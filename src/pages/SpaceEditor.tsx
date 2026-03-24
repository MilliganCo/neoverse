import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import EditorScene from '@/components/space/EditorScene';
import Scene3D from '@/components/3d/Scene3D';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { ArrowLeft, Move, RotateCw, Maximize2, Undo2, Redo2, Copy, Trash2, Settings, Play, RotateCcw, Save, Upload } from 'lucide-react';
import { MOCK_OBJECTS, DROP_POOL } from '@/data/mockData';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { SpaceObject } from '@/types';

const SNAP_GRID = 0.5;

const SpaceEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { spaces, inventory, addObjectToSpace, updateSpaceObjects, updateSpace } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [playMode, setPlayMode] = useState<'edit' | 'playing' | 'finished'>('edit');
  const [playTimeLeft, setPlayTimeLeft] = useState(7);
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishTags, setPublishTags] = useState('');
  const [publishPublic, setPublishPublic] = useState(true);

  const space = spaces.find(s => s.id === id);

  useEffect(() => {
    if (playMode !== 'playing') return;
    const tick = setInterval(() => {
      setPlayTimeLeft((t) => {
        if (t <= 1) {
          setPlayMode('finished');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [playMode]);

  const handlePlay7s = () => {
    setPlayTimeLeft(7);
    setPlayMode('playing');
    setSelectedId(null);
  };

  const handlePublish = () => {
    if (!space) return;
    const tags = publishTags.split(/[\s,]+/).filter(Boolean);
    updateSpace(space.id, {
      visibility: publishPublic ? 'public' : 'private',
      tags: tags.length > 0 ? tags : undefined,
      publishedAt: new Date().toISOString(),
    });
    setPublishOpen(false);
    setPublishTags('');
    setPublishPublic(true);
  };

  const applyObjects = useCallback((objects: SpaceObject[]) => {
    if (space) updateSpaceObjects(space.id, objects);
  }, [space, updateSpaceObjects]);

  const { push, undo, redo, apply, canUndo, canRedo } = useUndoRedo(
    space?.objects ?? [],
    applyObjects
  );

  const objectLookup = useMemo(() => {
    const lookup: Record<string, typeof inventory[0]> = {};
    [...MOCK_OBJECTS, ...DROP_POOL].forEach(obj => { lookup[obj.id] = obj; });
    inventory.forEach(obj => { lookup[obj.id] = obj; });
    return lookup;
  }, [inventory]);

  const snapPosition = (p: [number, number, number]) =>
    snapEnabled && transformMode === 'translate'
      ? p.map(x => Math.round(x / SNAP_GRID) * SNAP_GRID) as [number, number, number]
      : p;

  const handleTransform = (
    soId: string,
    position: [number, number, number],
    rotation: [number, number, number],
    scale: [number, number, number]
  ) => {
    if (!space) return;
    const snappedPos = snapPosition(position);
    const updated = space.objects.map(so => {
      const soIdCheck = so.id || `legacy-${so.objectId}`;
      if (soIdCheck === soId) {
        return { ...so, position: snappedPos, rotation, scale };
      }
      return so;
    });
    apply(updated);
  };

  const handleAddObject = (obj: typeof inventory[0]) => {
    if (!space) return;
    push([...space.objects, {
      id: `so-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      objectId: obj.id,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: obj.scale,
    }]);
  };

  const handleDelete = () => {
    if (!space || !selectedId) return;
    push(space.objects.filter(so => (so.id || `legacy-${so.objectId}`) !== selectedId));
    setSelectedId(null);
  };

  const handleDuplicate = () => {
    if (!space || !selectedId) return;
    const target = space.objects.find(so => (so.id || `legacy-${so.objectId}`) === selectedId);
    if (!target) return;
    const copy: SpaceObject = {
      ...target,
      id: `so-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      position: [target.position[0] + 0.5, target.position[1], target.position[2]],
    };
    push([...space.objects, copy]);
    setSelectedId(copy.id);
  };

  if (!space) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <p className="text-muted-foreground mb-4">Пространство не найдено</p>
        <Button onClick={() => navigate('/')} variant="outline">
          Назад
        </Button>
      </div>
    );
  }

  const currentObjects = space.objects;
  const spaceObjectsWithId = currentObjects.map(so => ({
    ...so,
    id: so.id || `legacy-${so.objectId}-${so.position.join('-')}`,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center justify-between gap-4 p-4 border-b border-border/50 glass-card flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold truncate">{space.name}</h1>
        </div>
        <div className="flex gap-1 items-center">
          {playMode === 'edit' && (
            <>
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-9 gap-1.5 px-3"
              onClick={() => setPublishOpen(true)}
              title="Опубликовать"
            >
              <Upload className="w-4 h-4" /> Publish
            </Button>
            <Button
              variant="default"
              size="sm"
              className="rounded-lg h-9 gap-1.5 px-3"
              onClick={handlePlay7s}
              title="Play 7s"
            >
              <Play className="w-4 h-4" /> Play 7s
            </Button>
            </>
          )}
          <div className="w-px h-5 bg-border/50 mx-1" />
          {playMode === 'edit' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-9 w-9"
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-9 w-9"
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
            </>
          )}
          <div className="w-px h-5 bg-border/50 mx-1" />
          {playMode === 'edit' && selectedId && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-9 w-9"
                onClick={handleDuplicate}
                title="Duplicate"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-9 w-9 text-destructive hover:text-destructive"
                onClick={handleDelete}
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="w-px h-5 bg-border/50 mx-1" />
            </>
          )}
          {playMode === 'edit' && (
            <>
          <Button
            variant={transformMode === 'translate' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-lg h-9 w-9"
            onClick={() => setTransformMode('translate')}
            title="Move"
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant={transformMode === 'rotate' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-lg h-9 w-9"
            onClick={() => setTransformMode('rotate')}
            title="Rotate"
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant={transformMode === 'scale' ? 'secondary' : 'ghost'}
            size="icon"
            className="rounded-lg h-9 w-9"
            onClick={() => setTransformMode('scale')}
            title="Scale"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
            </>
          )}
          <div className="w-px h-5 bg-border/50 mx-1" />
          {playMode === 'edit' && (
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-lg h-9 w-9"
                title="Настройки"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] glass-card border-l border-border/50">
              <SheetHeader>
                <SheetTitle>Настройки</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap" className="text-sm">Snap to Grid</Label>
                  <Switch id="snap" checked={snapEnabled} onCheckedChange={setSnapEnabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="physics" className="text-sm">Физика (Play 7s)</Label>
                  <Switch id="physics" checked={physicsEnabled} onCheckedChange={setPhysicsEnabled} />
                </div>
                <div>
                  <Label className="text-sm block mb-2">Шаг сетки</Label>
                  <p className="text-xs text-muted-foreground">{SNAP_GRID}</p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          )}
        </div>
      </header>

      <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
        <DialogContent className="glass-card border-border/50 rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Опубликовать пространство</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
            Убедись, что контент соответствует правилам сообщества.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Теги (через запятую)</label>
              <Input
                value={publishTags}
                onChange={(e) => setPublishTags(e.target.value)}
                placeholder="3D, art, minimal..."
                className="rounded-xl"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm">Публичное</Label>
              <Switch checked={publishPublic} onCheckedChange={setPublishPublic} />
            </div>
          </div>
          <Button onClick={handlePublish} className="w-full rounded-xl mt-2">
            Опубликовать
          </Button>
        </DialogContent>
      </Dialog>

      <div className="flex-1 min-h-0 flex flex-col relative">
        <div className="flex-1 min-h-[280px] p-4">
          <EditorScene
            spaceObjects={spaceObjectsWithId}
            objectLookup={objectLookup}
            selectedId={selectedId}
            transformMode={transformMode}
            onSelect={setSelectedId}
            onTransform={handleTransform}
            isPlayMode={playMode === 'playing' || playMode === 'finished'}
          />
        </div>

        {playMode === 'playing' && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 glass-card rounded-xl px-4 py-2">
            <span className="text-lg font-bold tabular-nums">{playTimeLeft}s</span>
          </div>
        )}

        {playMode === 'finished' && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/60 backdrop-blur-sm">
            <div className="glass-card rounded-2xl p-6 flex flex-col gap-3 max-w-xs">
              <p className="text-center font-semibold">Симуляция завершена</p>
              <div className="flex flex-col gap-2">
                <Button onClick={() => { setPlayTimeLeft(7); setPlayMode('playing'); }} className="rounded-xl">
                  <RotateCcw className="w-4 h-4 mr-2" /> Replay
                </Button>
                <Button variant="outline" onClick={() => {}} className="rounded-xl">
                  <Save className="w-4 h-4 mr-2" /> Save Take
                </Button>
                <Button variant="secondary" onClick={() => setPlayMode('edit')} className="rounded-xl">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back to Edit
                </Button>
              </div>
            </div>
          </div>
        )}

        {playMode === 'edit' && (
        <div className="flex-shrink-0 border-t border-border/50 glass-card p-3">
          <p className="text-xs text-muted-foreground mb-2">Inventory — нажми, чтобы добавить</p>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-2">
              {inventory.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => handleAddObject(obj)}
                  className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden glass-card border border-border/50 hover:scale-105 transition-transform"
                >
                  <Scene3D geometry={obj.geometry} color={obj.color} scale={[0.6, 0.6, 0.6]} autoRotate />
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
        )}
      </div>
    </div>
  );
};

export default SpaceEditor;
