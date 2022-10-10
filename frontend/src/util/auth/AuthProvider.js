import jwtDecode from "jwt-decode";
import { useState, createContext } from "react";
import { getCookie } from "../cookies";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  let initialIsLogin = false;
  const decodedToken = getCookie("token") ? jwtDecode(getCookie("token")) : {};
  if (decodedToken && decodedToken.exp * 1000 >= Date.now()) {
    initialIsLogin = true;
  }
  const [isLogin, setIsLogin] = useState(initialIsLogin);

  const login = () => {
    setIsLogin(true);
  };

  const logout = () => {
    setIsLogin(false);
  };

  return <AuthContext.Provider value={{ isLogin, login, logout }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
