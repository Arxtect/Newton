/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-10-09 16:58:26
 */
import { useState, useCallback, useEffect } from "react";
import _ from "lodash";
import { debugConsole } from "@/utils";
import localStorage from "@/utils/local-storage";

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch (e) {
    debugConsole.error("double stringify exception", e);
    return null;
  }
};

const safeParse = (value) => {
  try {
    return JSON.parse(value);
  } catch (e) {
    debugConsole.error("double parse exception", e);
    return null;
  }
};

function usePersistedState(
  key,
  defaultValue,
  listen = false,
  doubleStringifyAndParse = false
) {
  const getItem = useCallback(
    (key) => {
      const item = localStorage.getItem(key);
      return doubleStringifyAndParse ? safeParse(item) : item;
    },
    [doubleStringifyAndParse]
  );

  const setItem = useCallback(
    (key, value) => {
      const val = doubleStringifyAndParse ? safeStringify(value) : value;
      localStorage.setItem(key, val);
    },
    [doubleStringifyAndParse]
  );

  const [value, setValue] = useState(() => {
    return getItem(key) ?? defaultValue;
  });

  const updateFunction = useCallback(
    (newValue) => {
      setValue((value) => {
        const actualNewValue = _.isFunction(newValue)
          ? newValue(value)
          : newValue;

        if (actualNewValue === defaultValue) {
          localStorage.removeItem(key);
        } else {
          setItem(key, actualNewValue);
        }
        return actualNewValue;
      });
    },
    [key, defaultValue, setItem]
  );

  useEffect(() => {
    if (listen) {
      const listener = (event) => {
        if (event.key === key) {
          setValue(getItem(key) ?? defaultValue);
        }
      };

      window.addEventListener("storage", listener);

      return () => {
        window.removeEventListener("storage", listener);
      };
    }
  }, [defaultValue, key, listen, getItem]);

  return [value, updateFunction];
}

export default usePersistedState;
