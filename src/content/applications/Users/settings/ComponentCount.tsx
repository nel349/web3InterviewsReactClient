import "./style.css";
import { useCountContext } from "./CountProvider";

export const ComponentCount = () => {
  const { count, setCount } = useCountContext();

  return (
    <div>
      <button
        onClick={(e) => {
          setCount(count * 10);
        }}
      >
        Mult
      </button>
      <button
        onClick={(e) => {
          setCount(count / 10);
        }}
      >
        Divide
      </button>
    </div>
  );
};