import { useEffect } from 'react';

export const useOnMount = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, []);
};
