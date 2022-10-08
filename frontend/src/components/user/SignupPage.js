import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Grid,
  Paper,
  Container,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Snackbar,
  Alert,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_CREATED } from "../../constants";
import { Link } from "react-router-dom";

const col1Style = {
  pl: "8rem",
};
const col2Style = {
  width: "50%",
};
const textfieldStyle = {
  marginBottom: "1rem",
};

function SignupPage() {
  const [username, setUsername] = useState("");
  const [isUserErr, setIsUserErr] = useState(false);
  const [userErr, setUserErr] = useState("");
  const [email, setEmail] = useState("");
  const [isEmailErr, setIsEmailErr] = useState(false);
  const [emailErr, setEmailErr] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordErr, setIsPasswordErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleSignup = async () => {
    const res = await axios.post(URL_USER_SVC, { username, email, password }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setIsUserErr(false);
        setUserErr("");
        setIsEmailErr(false);
        setEmailErr("");
        setIsPasswordErr(false);
        setPasswordErr("");
        if (err.response.data.err.username) {
          setIsUserErr(true);
          setUserErr(err.response.data.err.username);
        }
        if (err.response.data.err.email) {
          setIsEmailErr(true);
          setEmailErr(err.response.data.err.email);
        }
        if (err.response.data.err.password) {
          setIsPasswordErr(true);
          setPasswordErr(err.response.data.err.password);
        }
      } else {
        setIsAlertOpen(true);
      }
    });
    if (res && res.status === STATUS_CODE_CREATED) {
      setIsDialogOpen(true);
    }
  };

  const closeAlert = () => setIsAlertOpen(false);

  const signupResult = () => {
    return (
      <Box>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={isAlertOpen}
          autoHideDuration={4000}
          onClose={closeAlert}>
          <Alert severity="error" onClose={closeAlert}>
            Please try again later
          </Alert>
        </Snackbar>
        <Dialog open={isDialogOpen}>
          <DialogTitle>Success</DialogTitle>
          <DialogContent>
            <DialogContentText>Account successfully created</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button component={Link} to="/login">
              Log in
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return (
    <Grid container>
      <Grid item xs={2} />
      <Grid item xs={8}>
        <Paper elevation={3} sx={{ width: "65%", margin: "auto" }}>
          <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Typography variant={"h3"} m={"1rem"}>
              Sign Up
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
                    <Typography variant={"body1"}>Email</Typography>
                  </TableCell>
                  <TableCell sx={col2Style}>
                    <TextField
                      variant="filled"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      error={isEmailErr}
                      helperText={emailErr}
                      sx={textfieldStyle}
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
            <Button variant={"contained"} onClick={handleSignup}>
              Sign up
            </Button>
            {signupResult()}
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} m={"1rem"}>
              <Typography variant={"body1"}>Already have an account?</Typography>
              <Typography component={Link} to="/login" variant={"body1"}>
                Click here
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={2} />
    </Grid>
  );
}

export default SignupPage;
