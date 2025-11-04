
import React, { createContext } from 'react';
import { useAudio } from '../hooks/useAudio';

type AudioContextType = ReturnType<typeof useAudio> | null;

export const AudioContext = createContext<AudioContextType>(null);

interface AudioProviderProps {
    children: React.ReactNode;
}

export const AudioProvider: React.FC<AudioProviderProps> = ({ children }) => {
  const audio = useAudio();
  return (
    <AudioContext.Provider value={audio}>
      {children}
    </AudioContext.Provider>
  );
};
