import "./style.css";
import { useCountContext } from "./CountProvider";

export const AnotherComponentCount = () => {
  const { count, setCount } = useCountContext();

  return (
    <div>
      <button
        onClick={(e) => {
          setCount(count + 1);
        }}
      >
        Add
      </button>
      <button
        onClick={(e) => {
          setCount(count - 1);
        }}
      >
        Subtract
      </button>
    </div>
  );
};