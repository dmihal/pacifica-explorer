'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Network = 'mainnet' | 'testnet';

interface NetworkContextType {
  network: Network;
  setNetwork: (network: Network) => void;
  baseUrl: string;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetwork] = useState<Network>('mainnet');

  useEffect(() => {
    const saved = localStorage.getItem('pacifica-network') as Network;
    if (saved === 'mainnet' || saved === 'testnet') {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNetwork(saved);
    }
  }, []);

  const handleSetNetwork = (net: Network) => {
    setNetwork(net);
    localStorage.setItem('pacifica-network', net);
  };

  const baseUrl = network === 'mainnet' 
    ? 'https://api.pacifica.fi/api/v1' 
    : 'https://test-api.pacifica.fi/api/v1';

  return (
    <NetworkContext.Provider value={{ network, setNetwork: handleSetNetwork, baseUrl }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
