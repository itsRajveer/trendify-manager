import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TimeRange } from '@/types/stock';

interface DashboardContextType {
  globalTimeRange: TimeRange;
  setGlobalTimeRange: (timeRange: TimeRange) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [globalTimeRange, setGlobalTimeRange] = useState<TimeRange>('7d');

  return (
    <DashboardContext.Provider value={{ globalTimeRange, setGlobalTimeRange }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
