import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./components/SignupPage";
import LoginPage from "./components/LoginPage";
import DifficultySelection from "./components/DifficultySelection";
import Room from "./components/Room";
import Navbar from "./components/Navbar";
import ForgetPassword from "./components/ForgetPasswordPage";
import ResetPassword from "./components/ResetPasswordPage";
import { Box } from "@mui/material";
import { URL_MATCH_SVC } from "./configs";
import io from "socket.io-client";

const socket = io.connect(URL_MATCH_SVC);

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
            <Route path="/diff" element={<DifficultySelection socket={socket} />} />
            <Route path="/room/:id" element={<Room socket={socket} />} />
            <Route path="/forget-password" element={<ForgetPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </Router>
      </Box>
    </div>
  );
}

export default App;
