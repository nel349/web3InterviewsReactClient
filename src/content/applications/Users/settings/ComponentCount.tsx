import "./style.css";
import { useAuthenticationContext } from "./AuthenticationProvider";

export const ComponentCount = () => {
  const { signedIn, setSigned } = useAuthenticationContext();

  return (
    <div>
      <button
        onClick={(e) => {
          setSigned(true);
        }}
      >
        Set True
      </button>
      <button
        onClick={(e) => {
          setSigned(false);
        }}
      >
        Set False
      </button>
    </div>
  );
};