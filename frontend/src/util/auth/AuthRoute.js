import { Outlet, Navigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import useAuth from "./useAuth";
import { getCookie } from "../cookies";
import jwtDecode from "jwt-decode";

const AuthRoute = () => {
  const auth = useAuth();
  useEffect(() => {
    const decodedToken = getCookie("token") ? jwtDecode(getCookie("token")) : {};
    if (decodedToken && decodedToken.exp * 1000 >= Date.now()) {
      auth.login();
    } else {
      auth.logout();
    }
  });

  return auth.isLogin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthRoute;
