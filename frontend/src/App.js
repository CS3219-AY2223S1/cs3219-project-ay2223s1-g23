import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./components/user/SignupPage";
import LoginPage from "./components/user/LoginPage";
import HomePage from "./components/HomePage";
import RoomPage from "./components/room/RoomPage";
import ForgetPassword from "./components/user/ForgetPasswordPage";
import ResetPassword from "./components/user/ResetPasswordPage";
import Navbar from "./components/layout/Navbar";
import AuthRoute from "./util/auth/AuthRoute";
import useAuth from "./util/auth/useAuth";

import { Box } from "@mui/material";

function App() {
  const auth = useAuth();

  return (
    <div className="App">
      <Router>
        <Navbar />
        <Box display={"flex"} flexDirection={"column"} padding={"4rem"}>
          <Routes>
            <Route element={<AuthRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/room/:id" element={<RoomPage />} />
            </Route>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={auth.isLogin ? <Navigate to="/" /> : <LoginPage />} />

            <Route path="/room/:id" element={<RoomPage />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          </Routes>
        </Box>
      </Router>
    </div>
  );
}

export default App;
