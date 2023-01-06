import React, { createContext, Dispatch, SetStateAction, useContext } from "react";
const AuthenticationContext = createContext<ContextType | null>(null);

interface ContextType {
  signedIn: boolean, setSigned: Dispatch<SetStateAction<boolean>>
}

const AuthenticationProvider = ({ children }) => {
  const [signedIn, setSigned] = React.useState(false);

  return (
    <AuthenticationContext.Provider value={
      {
        signedIn: signedIn,
        setSigned: setSigned
      }
    }>
      <p>Is signed in { String(signedIn)}</p>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationContext = () => useContext(AuthenticationContext);

export default AuthenticationProvider;
