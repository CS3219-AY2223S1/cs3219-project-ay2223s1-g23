import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  Container,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState, useContext } from "react";
import axios from "axios";
import { URL_USER_SVC_LOGIN } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../../constants";
import { Link, useNavigate } from "react-router-dom";
import { setCookie } from "../../util/cookies";
import useAuth from "../../util/auth/useAuth";
import fireFine from "../../static/fire-fine.mp4";

const col1Style = {
  width: "50%",
  pl: "5rem",
};
const col2Style = {
  width: "50%",
};
const textfieldStyle = {
  marginBottom: "1rem",
};

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isUserErr, setIsUserErr] = useState(false);
  const [userErr, setUserErr] = useState("");
  const [isPasswordErr, setIsPasswordErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState("");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const auth = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post(URL_USER_SVC_LOGIN, { username, password }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setIsUserErr(false);
        setUserErr("");
        setIsPasswordErr(false);
        setPasswordErr("");
        if (err.response.data.err.username) {
          setIsUserErr(true);
          setUserErr(err.response.data.err.username);
        }
        if (err.response.data.err.password) {
          setIsPasswordErr(true);
          setPasswordErr(err.response.data.err.password);
        }
      } else {
        setIsAlertOpen(true);
        setAlertMsg("Please try again later");
      }
    });
    if (res && res.status === STATUS_CODE_OK) {
      const token = res.data.jwt;
      setCookie("token", token, 0.01);
      console.log(document.cookie);
      auth.login();
      console.log(auth.isLogin);
      navigate(`/`);
    }
  };

  const closeAlert = () => setIsAlertOpen(false);

  return (
    <Grid container>
      <Grid item xs={7}>
        <video width="100%" height="100%" src={fireFine} autoPlay loop muted />
      </Grid>
      <Grid item xs={5}>
        <Paper elevation={3} sx={{ width: "80%", margin: "auto" }}>
          <Box display={"flex"}>
            <Typography variant={"h3"} mt={"2rem"} ml={"4rem"} mb={"1rem"}>
              Login
            </Typography>
          </Box>
          <Container fixed>
            <Table aria-label="simple table" sx={{ "& td": { border: 0 } }}>
              <TableBody>
                <TableRow>
                  <TableCell sx={col1Style}>
                    <Typography variant={"body1"}>Username</Typography>
                  </TableCell>
                  <TableCell sx={col2Style}>
                    <TextField
                      variant="filled"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      error={isUserErr}
                      helperText={userErr}
                      sx={textfieldStyle}
                      autoFocus
                    />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={col1Style}>
                    <Typography variant={"body1"}>Password</Typography>
                  </TableCell>
                  <TableCell sx={col2Style}>
                    <TextField
                      variant="filled"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      error={isPasswordErr}
                      helperText={passwordErr}
                      sx={textfieldStyle}
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Container>
          <Box
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
            justifyContent={"center"}>
            <Button variant={"contained"} onClick={handleLogin}>
              Log in
            </Button>
            <Snackbar
              anchorOrigin={{ vertical: "top", horizontal: "center" }}
              open={isAlertOpen}
              autoHideDuration={4000}
              onClose={closeAlert}>
              <Alert severity="error" onClose={closeAlert}>
                {alertMsg}
              </Alert>
            </Snackbar>
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} margin={"1rem"}>
              <Typography variant={"body1"}> Forgotten Password?</Typography>
              <Typography component={Link} to="/forget-password" variant={"body1"}>
                Reset it
              </Typography>
            </Box>
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
              <Typography variant={"body1"} marginBottom={"2rem"}>
                Don&apos;t have an account?
              </Typography>
              <Typography component={Link} to="/signup" variant={"body1"} marginBottom={"2rem"}>
                Click here
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

export default LoginPage;
