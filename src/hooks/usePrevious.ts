import { useEffect, useRef } from 'react';

// Stores the previous value of a variable for comparison between renders,
// helpful for detecting if a value has actually changed in complex useEffect blocks, etc
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
