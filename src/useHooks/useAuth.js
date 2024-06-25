/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-06-14 09:48:52
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "@/services";
import { useUserStore } from "store";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { accessToken } = useUserStore((state) => ({
    accessToken: state.accessToken,
  }));

  useEffect(() => {
    if (!accessToken) {
      setAuth(false);
      setUser(null);
      setLoading(false);
      return;
    }

    const getUser = async () => {
      setLoading(true);
      try {
        const { data } = await getMe();
        setUser(data?.user ?? {});
        setAuth(!!data?.user?.email);
      } catch (err) {
        setAuth(false);
        setUser(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{
        user,
        auth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
