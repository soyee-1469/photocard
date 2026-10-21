import React, { createContext, useContext, ReactNode } from 'react';
import { PhotocardApi } from './PhotocardApi';
import { MockPhotocardApi } from '../mock/MockPhotocardApi';
import { defaultStorage } from '../storage/StorageAdapter';

const ApiContext = createContext<PhotocardApi | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const api = new MockPhotocardApi(defaultStorage);

  return <ApiContext.Provider value={api}>{children}</ApiContext.Provider>;
}

export function useApi(): PhotocardApi {
  const api = useContext(ApiContext);
  if (!api) {
    throw new Error('useApi must be used within ApiProvider');
  }
  return api;
}
