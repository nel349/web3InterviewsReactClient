import React, { createContext, Dispatch, SetStateAction, useContext } from "react";
const AuthenticationContext = createContext<ContextType | null>(null);

interface ContextType {
  signedIn: boolean, 
  setSigned: Dispatch<SetStateAction<boolean>>,
  accessToken: string,
  setAccessToken: Dispatch<SetStateAction<string>>
}

const AuthenticationProvider = ({ children }) => {
  const [signedIn, setSigned] = React.useState(false);
  const [accessToken, setAccessToken] = React.useState("");

  return (
    <AuthenticationContext.Provider value={
      {
        signedIn: signedIn,
        setSigned: setSigned,
        accessToken: accessToken,
        setAccessToken: setAccessToken
      }
    }>
      <p>Is signed in { String(signedIn)}</p>
      {children}
    </AuthenticationContext.Provider>
  );
};

export const useAuthenticationContext = () => useContext(AuthenticationContext);

export default AuthenticationProvider;
