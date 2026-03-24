import React, { createContext, useContext, useState, useCallback } from 'react';
import { Object3D, Space, SpaceObject, UserProfile } from '@/types';
import { MOCK_OBJECTS, MOCK_SPACES, DROP_POOL } from '@/data/mockData';

interface AppState {
  user: UserProfile;
  inventory: Object3D[];
  spaces: Space[];
  currentDrop: Object3D | null;
  theme: 'light' | 'dark';
}

interface AppContextType extends AppState {
  setUser: (user: UserProfile) => void;
  completeOnboarding: (nickname: string, avatarIndex: number) => void;
  claimDailyDrop: () => void;
  addToInventory: (obj: Object3D) => void;
  addObjectToSpace: (spaceId: string, obj: Object3D) => void;
  createSpace: (name: string, visibility: Space['visibility']) => string;
  updateSpace: (spaceId: string, data: Partial<Space>) => void;
  updateSpaceObjects: (spaceId: string, objects: SpaceObject[]) => void;
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>({
    nickname: '',
    avatarIndex: 0,
    onboardingComplete: false,
    dailyDropClaimed: false,
    lastDropDate: null,
    subscriptionPlan: 'free',
  });
  const [inventory, setInventory] = useState<Object3D[]>(MOCK_OBJECTS);
  const [spaces, setSpaces] = useState<Space[]>(MOCK_SPACES);
  const [currentDrop, setCurrentDrop] = useState<Object3D | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const completeOnboarding = useCallback((nickname: string, avatarIndex: number) => {
    setUser(prev => ({ ...prev, nickname, avatarIndex, onboardingComplete: true }));
    // Create 2 default spaces (Private + Public)
    const defaultSpaces: Space[] = [
      { id: 's1', name: 'My Private Room', visibility: 'private', objects: [], likes: 0, rating: 0, onSale: false, createdAt: new Date().toISOString().split('T')[0], coverColor: '#6d28d9' },
      { id: 's2', name: 'Public Gallery', visibility: 'public', objects: [], likes: 0, rating: 0, onSale: false, createdAt: new Date().toISOString().split('T')[0], coverColor: '#0891b2' },
    ];
    setSpaces(defaultSpaces);
    setInventory([]);
    // Generate first drop
    const drop = { ...DROP_POOL[Math.floor(Math.random() * DROP_POOL.length)], dateObtained: new Date().toISOString().split('T')[0] };
    setCurrentDrop(drop);
  }, []);

  const claimDailyDrop = useCallback(() => {
    if (currentDrop) {
      setInventory(prev => [...prev, currentDrop]);
      setUser(prev => ({ ...prev, dailyDropClaimed: true, lastDropDate: new Date().toISOString().split('T')[0] }));
    }
  }, [currentDrop]);

  const addToInventory = useCallback((obj: Object3D) => {
    setInventory(prev => [...prev, obj]);
  }, []);

  const addObjectToSpace = useCallback((spaceId: string, obj: Object3D) => {
    const spaceObject: SpaceObject = {
      id: `so-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      objectId: obj.id,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: obj.scale,
    };
    setSpaces(prev =>
      prev.map(s =>
        s.id === spaceId ? { ...s, objects: [...s.objects, spaceObject] } : s
      )
    );
  }, []);

  const createSpace = useCallback((name: string, visibility: Space['visibility']) => {
    const newSpace: Space = {
      id: `s${Date.now()}`,
      name,
      visibility,
      objects: [],
      likes: 0,
      rating: 0,
      onSale: false,
      createdAt: new Date().toISOString().split('T')[0],
      coverColor: visibility === 'public' ? '#0891b2' : '#6d28d9',
    };
    setSpaces(prev => [...prev, newSpace]);
    return newSpace.id;
  }, []);

  const updateSpace = useCallback((spaceId: string, data: Partial<Space>) => {
    setSpaces(prev =>
      prev.map(s => (s.id === spaceId ? { ...s, ...data } : s))
    );
  }, []);

  const updateSpaceObjects = useCallback((spaceId: string, objects: SpaceObject[]) => {
    setSpaces(prev =>
      prev.map(s => (s.id === spaceId ? { ...s, objects } : s))
    );
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  }, []);

  // Set dark mode on mount
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AppContext.Provider value={{
      user, inventory, spaces, currentDrop, theme,
      setUser, completeOnboarding, claimDailyDrop, addToInventory,
      addObjectToSpace, createSpace, updateSpace, updateSpaceObjects,
      toggleTheme,
    }}>
      {children}
    </AppContext.Provider>
  );
};
