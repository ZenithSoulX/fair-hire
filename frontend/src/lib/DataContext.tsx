import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Candidate, BiasMetrics, KPIData } from '../types';
import { MOCK_CANDIDATES, MOCK_BIAS, MOCK_KPI } from './mockData';

interface DataContextType {
  candidates: Candidate[];
  setCandidates: React.Dispatch<React.SetStateAction<Candidate[]>>;
  bias: BiasMetrics;
  setBias: React.Dispatch<React.SetStateAction<BiasMetrics>>;
  kpi: KPIData;
  setKpi: React.Dispatch<React.SetStateAction<KPIData>>;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [bias, setBias] = useState<BiasMetrics>(MOCK_BIAS);
  const [kpi, setKpi] = useState<KPIData>(MOCK_KPI);

  const resetData = () => {
    setCandidates(MOCK_CANDIDATES);
    setBias(MOCK_BIAS);
    setKpi(MOCK_KPI);
  };

  return (
    <DataContext.Provider
      value={{
        candidates,
        setCandidates,
        bias,
        setBias,
        kpi,
        setKpi,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
