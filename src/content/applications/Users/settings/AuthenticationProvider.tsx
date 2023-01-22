import React, { createContext, Dispatch, SetStateAction, useContext } from "react";
import { MySolanaProvider } from "./solana/anchorClient";

const AuthenticationContext = createContext<ContextType | null>(null);

interface ContextType {
  signedIn: boolean, 
  setSigned: Dispatch<SetStateAction<boolean>>,
  accessToken: string,
  setAccessToken: Dispatch<SetStateAction<string>>,
  solanaProvider: MySolanaProvider,
  setSolanaProvider: Dispatch<SetStateAction<MySolanaProvider>>,
}

const AuthenticationProvider = ({ children }) => {
  const [signedIn, setSigned] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState("");
  const [solanaProvider, setSolanaProvider] = React.useState(null);

  return (
    <AuthenticationContext.Provider value={
      {
        signedIn: signedIn,
        setSigned: setSigned,
        accessToken: accessToken,
        setAccessToken: setAccessToken,
        solanaProvider: solanaProvider,
        setSolanaProvider: setSolanaProvider
      }
    }>
      <p>Is signed in { String(signedIn)}</p>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationContext = () => useContext(AuthenticationContext);

export default AuthenticationProvider;
