import { Outlet, Navigate } from "react-router-dom";
import { useContext } from "react";
import useAuth from "./useAuth";

const AuthRoute = () => {
  const auth = useAuth();
  return auth.isLogin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AuthRoute;
