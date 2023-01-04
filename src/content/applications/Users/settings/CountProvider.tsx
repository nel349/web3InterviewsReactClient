import React, { createContext, Dispatch, SetStateAction, useContext } from "react";
const CountContext = createContext<ContextType | null>(null);

interface ContextType {
    count: number, setCount: Dispatch<SetStateAction<number>>
}

const CountProvider = ({ children }) => {
  const [count, setCount] = React.useState(0);

  return (
    <CountContext.Provider value={
      {
          count: count,
          setCount: setCount
      }
    }>
      <p>{count}</p>
      {children}
    </CountContext.Provider>
  );
};

export const useCountContext = () => useContext(CountContext);

export default CountProvider;
