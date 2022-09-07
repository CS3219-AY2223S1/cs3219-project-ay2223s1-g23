import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import SignupPage from "./components/SignupPage";
import DifficultySelection from "./components/DifficultySelection";
import Room from "./components/Room";
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
            <Route path="/room/:id" element={<Room />} />
          </Routes>
        </Router>
      </Box>
    </div>
  );
}

export default App;
