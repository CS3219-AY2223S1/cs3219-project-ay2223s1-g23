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
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_CREATED } from "../../constants";
import { Link } from "react-router-dom";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const handleSignup = async () => {
    setIsSignupSuccess(false);
    const res = await axios.post(URL_USER_SVC, { username, email, password }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setErrorDialog("ERROR: " + err.response.data.message);
      } else {
        setErrorDialog("Please try again later");
      }
    });
    if (res && res.status === STATUS_CODE_CREATED) {
      setSuccessDialog("Account successfully created");
      setIsSignupSuccess(true);
    }
  };

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
              <TableRow>
                <TableCell sx={{ pl: "10rem" }}>
                  <Typography variant={"body1"}>Username</Typography>
                </TableCell>
                <TableCell sx={{ width: "50%" }}>
                  <TextField
                    variant="filled"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    sx={{ marginBottom: "1rem" }}
                    autoFocus
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: "10rem" }}>
                  <Typography variant={"body1"}>Email</Typography>
                </TableCell>
                <TableCell sx={{ width: "50%" }}>
                  <TextField
                    variant="filled"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    sx={{ marginBottom: "2rem" }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: "10rem" }}>
                  <Typography variant={"body1"}>Password</Typography>
                </TableCell>
                <TableCell sx={{ width: "50%" }}>
                  <TextField
                    variant="filled"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{ marginBottom: "2rem" }}
                  />
                </TableCell>
              </TableRow>
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
            <Box display={"flex"} alignItems={"center"} justifyContent={"center"} m={"1rem"}>
              <Typography variant={"body1"}>Already have an account?</Typography>
              <Typography component={Link} to="/login" variant={"body1"}>
                Click here
              </Typography>
            </Box>
          </Box>
          <Dialog open={isDialogOpen} onClose={closeDialog}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText>{dialogMsg}</DialogContentText>
            </DialogContent>
            <DialogActions>
              {isSignupSuccess ? (
                <Button component={Link} to="/login">
                  Log in
                </Button>
              ) : (
                <Button onClick={closeDialog}>Done</Button>
              )}
            </DialogActions>
          </Dialog>
        </Paper>
      </Grid>
      <Grid item xs={2} />
    </Grid>
  );
}

export default SignupPage;
