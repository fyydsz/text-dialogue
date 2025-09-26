import { createContext, useContext, type ReactNode } from 'react';

interface MusicContextType {
  pauseMusic: () => void;
  resumeMusic: () => void;
  isPaused: boolean;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusicControl = () => {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error('useMusicControl must be used within a MusicProvider');
  }
  return context;
};

interface MusicProviderProps {
  children: ReactNode;
  pauseMusic: () => void;
  resumeMusic: () => void;
  isPaused: boolean;
}

export const MusicProvider = ({ children, pauseMusic, resumeMusic, isPaused }: MusicProviderProps) => {
  return (
    <MusicContext.Provider value={{ pauseMusic, resumeMusic, isPaused }}>
      {children}
    </MusicContext.Provider>
  );
};