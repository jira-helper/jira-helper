import { Container } from 'dioma';
import React, { createContext, useContext } from 'react';

const DiContext = createContext<Container | null>(null);
export const WithDi = ({ children, container }: { children: React.ReactNode; container: Container }) => {
  return <DiContext.Provider value={container}>{children}</DiContext.Provider>;
};

export const useDi = () => {
  const container = useContext(DiContext);
  if (!container) {
    throw new Error('Container not found');
  }
  return container;
};
