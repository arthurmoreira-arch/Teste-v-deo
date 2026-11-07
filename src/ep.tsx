import React, {createContext, useContext, useMemo} from 'react';
import {Episode, timing} from './script';

type Ctx = {ep: Episode} & ReturnType<typeof timing>;
const EpCtx = createContext<Ctx | null>(null);

export const EpProvider = ({ep, children}: {ep: Episode; children: React.ReactNode}) => {
  const value = useMemo(() => ({ep, ...timing(ep)}), [ep]);
  return <EpCtx.Provider value={value}>{children}</EpCtx.Provider>;
};

export const useEp = () => {
  const c = useContext(EpCtx);
  if (!c) throw new Error('useEp fora do EpProvider');
  return c;
};
