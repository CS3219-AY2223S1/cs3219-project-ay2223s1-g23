<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignupPage from "./components/SignupPage";
import DifficultySelection from "./components/DifficultySelection";
=======
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignupPage from "./components/SignupPage";
import DifficultySelection from "./components/DifficultySelection";
import Room from "./components/Room";
>>>>>>> 6bd27b520bd5302070f8c59a7da064387568d940
import { Box } from "@mui/material";
import { URL_MATCH_SVC } from "./configs";
import io from "socket.io-client";

const socket = io.connect(URL_MATCH_SVC);

function App() {
  return (
    <div className="App">
      <Box display={"flex"} flexDirection={"column"} padding={"4rem"}>
        <Router>
          <Routes>
<<<<<<< HEAD
            <Route exact path="/" element={<Navigate replace to="/signup" />}></Route>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/diff" element={<DifficultySelection />} />
=======
            <Route
              exact
              path="/"
              element={<Navigate replace to="/signup" />}
            ></Route>
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/diff"
              element={<DifficultySelection socket={socket} />}
            />
            <Route path="/room/:id" element={<Room socket={socket} />} />
>>>>>>> 6bd27b520bd5302070f8c59a7da064387568d940
          </Routes>
        </Router>
      </Box>
    </div>
  );
}

export default App;
