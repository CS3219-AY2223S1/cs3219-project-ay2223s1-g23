import { useState, createContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(document.cookie.includes("token"));

  const login = () => {
    setIsLogin(true);
  };

  const logout = () => {
    setIsLogin(false);
  };

  return <AuthContext.Provider value={{ isLogin, login, logout }}>{children}</AuthContext.Provider>;
};

export default AuthContext;
