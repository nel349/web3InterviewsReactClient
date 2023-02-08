import { Metaplex, walletAdapterIdentity } from '@metaplex-foundation/js';
import { MetaplexContext } from './useMetaplex';
import { useMemo } from 'react';
import { useAuthenticationContext } from '../../AuthenticationProvider';

const MetaplexProvider = ({ children }) => {
  const { solanaProvider } = useAuthenticationContext();

  const wallet =  solanaProvider?.wallet;
  const connection = solanaProvider?.connection;

  const metaplex = useMemo(
    () => {
      if (solanaProvider?.connection) {
        console.log("HERE: " , solanaProvider?.connection);
        return Metaplex.make(solanaProvider?.connection).use(walletAdapterIdentity(wallet))
      }
    },
    [connection, wallet]
  );

  return (
    <MetaplexContext.Provider value={{ metaplex }}>
      {children}
    </MetaplexContext.Provider>
  )
}

export default MetaplexProvider;
