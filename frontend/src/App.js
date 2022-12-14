import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { URL_COMM_SVC, URL_MATCH_SVC } from "./configs";
import io from "socket.io-client";

import SignupPage from "./components/user/SignupPage";
import LoginPage from "./components/user/LoginPage";
import HomePage from "./components/HomePage";
import RoomPage from "./components/room/RoomPage";
import HistoryPage from "./components/room/HistoryPage";
import ForgetPassword from "./components/user/ForgetPasswordPage";
import ResetPassword from "./components/user/ResetPasswordPage";
import Navbar from "./components/layout/Navbar";
import AuthRoute from "./util/auth/AuthRoute";
import useAuth from "./util/auth/useAuth";

import { Box } from "@mui/material";

const voiceSocket = io.connect(URL_COMM_SVC);

function App() {
  const auth = useAuth();

  return (
    <div className="App">
      <Router>
        <Navbar />
        <Box display={"flex"} flexDirection={"column"} padding={"4rem"}>
          <Routes>
            {/*Protected route */}
            <Route path="/" element={<AuthRoute />}>
              <Route path="/" element={<HomePage />} />
            </Route>
            <Route path="/" element={<AuthRoute />}>
              <Route path="/room/:id" element={<RoomPage voiceSocket={voiceSocket} />} />
            </Route>
            <Route path="/" element={<AuthRoute />}>
              <Route path="/history/:histId" element={<HistoryPage />} />
            </Route>
            {/*Protected route */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={auth.isLogin ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
          </Routes>
        </Box>
      </Router>
    </div>
  );
}

export default App;
