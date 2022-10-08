import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { URL_COMM_SVC, URL_MATCH_SVC } from "./configs";
import io from "socket.io-client";

import SignupPage from "./components/user/SignupPage";
import LoginPage from "./components/user/LoginPage";
import HomePage from "./components/HomePage";
import RoomPage from "./components/room/RoomPage";
import ForgetPassword from "./components/user/ForgetPasswordPage";
import ResetPassword from "./components/user/ResetPasswordPage";
import Navbar from "./components/layout/Navbar";

import { Box } from "@mui/material";

const matchSocket = io.connect(URL_MATCH_SVC);
const voiceSocket = io.connect(URL_COMM_SVC);

function App() {
  return (
    <div className="App">
      <Navbar />
      <Box display={"flex"} flexDirection={"column"} padding={"4rem"}>
        <Router>
          <Routes>
            <Route exact path="/" element={<Navigate replace to="/login" />}></Route>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/diff" element={<HomePage socket={matchSocket} />} />
            <Route
              path="/room/:id"
              element={<RoomPage matchSocket={matchSocket} voiceSocket={voiceSocket} />}
            />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Router>
      </Box>
    </div>
  );
}

export default App;
