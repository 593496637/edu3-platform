import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { graphClient } from '../lib/graph-client';

interface GraphProviderProps {
  children: React.ReactNode;
}

/**
 * The Graph Apollo Provider
 * 
 * 将此 Provider 包装在应用的根部，与 WagmiProvider 同级
 */
export function GraphProvider({ children }: GraphProviderProps) {
  return (
    <ApolloProvider client={graphClient}>
      {children}
    </ApolloProvider>
  );
}

export default GraphProvider;
