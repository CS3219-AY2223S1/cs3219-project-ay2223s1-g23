import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC_LOGIN, URL_USER_SVC_USER_INFO } from "../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../constants";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");

  const handleLogin = async () => {
    const res = await axios.post(URL_USER_SVC_LOGIN, { username, password }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setErrorDialog("ERROR: " + err.response.data.message);
      } else {
        setErrorDialog("Please try again later");
      }
    });
    if (res && res.status === STATUS_CODE_OK) {
      const token = res.data.jwt;
      setSuccessDialog("Account successfully login with JWT:" + token);
      setCookie("token", token, 0.01);
      console.log(document.cookie);
    }
  };

  const handleGetInfo = async () => {
    const token = getCookie("token");
    console.log(document.cookie);
    const res = await axios
      .get(URL_USER_SVC_USER_INFO, { headers: { Authorization: "Bearer " + token } })
      .catch((err) => {
        console.log(err);
        if (err.response.status === STATUS_CODE_BAD_REQUEST) {
          setErrorDialog("ERROR: " + err.response.data.message);
        } else {
          setErrorDialog("Please try again later");
        }
      });
    if (res && res.status === STATUS_CODE_OK) {
      setSuccessDialog(res.data);
    }
  };

  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }

  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  const closeDialog = () => setIsDialogOpen(false);

  const setSuccessDialog = (msg) => {
    setIsDialogOpen(true);
    setDialogTitle("Success");
    setDialogMsg(msg);
  };

  const setErrorDialog = (msg) => {
    setIsDialogOpen(true);
    setDialogTitle("Error");
    setDialogMsg(msg);
  };

  return (
    <Box display={"flex"} flexDirection={"column"} width={"30%"}>
      <Typography variant={"h3"} marginBottom={"2rem"}>
        Log in
      </Typography>
      <TextField
        label="Username"
        variant="standard"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ marginBottom: "1rem" }}
        autoFocus
      />
      <TextField
        label="Password"
        variant="standard"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ marginBottom: "2rem" }}
      />
      <Box display={"flex"} flexDirection={"row"} justifyContent={"flex-end"}>
        <Button variant={"outlined"} onClick={handleLogin}>
          Log in
        </Button>
      </Box>

      <Box display={"flex"} flexDirection={"row"} justifyContent={"flex-end"}>
        <Button variant={"outlined"} onClick={handleGetInfo}>
          Get Info
        </Button>
      </Box>

      <Dialog open={isDialogOpen} onClose={closeDialog}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogMsg}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LoginPage;
