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
  Table,
  TableRow,
  TableCell,
  Container,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { URL_USER_SVC } from "../../configs";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_CREATED } from "../../constants";
import { Link } from "react-router-dom";

function ResetPasswordPage() {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");

  const handleResetPassword = async () => {
    const res = await axios
      .post(URL_USER_SVC, { username, newPassword, confirmNewPassword })
      .catch((err) => {
        if (err.response.status === STATUS_CODE_BAD_REQUEST) {
          setErrorDialog("ERROR: " + err.response.data.message);
        } else {
          setErrorDialog("Please try again later");
        }
      });
    if (res && res.status === STATUS_CODE_CREATED) {
      setSuccessDialog("Password Reset successfully");
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
      <Grid item xs={8} display="flex" justifyContent={"center"}>
        <Paper elevation={3} sx={{ width: "65%", margin: "auto" }}>
          <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
            <Typography variant={"h3"} m={"1rem"}>
              Reset Password
            </Typography>
          </Box>
          <Container fixed>
            <Table aria-label="simple table" sx={{ "& td": { border: 0 } }}>
              <TableRow>
                <TableCell sx={{ pl: "6rem" }}>
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
                <TableCell sx={{ pl: "6rem" }}>
                  <Typography variant={"body1"}>New Password</Typography>
                </TableCell>
                <TableCell sx={{ width: "50%" }}>
                  <TextField
                    variant="filled"
                    type="email"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ marginBottom: "2rem" }}
                  />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ pl: "6rem" }}>
                  <Typography variant={"body1"}>Confirm New Password</Typography>
                </TableCell>
                <TableCell sx={{ width: "50%" }}>
                  <TextField
                    variant="filled"
                    type="confirm password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
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
            <Button
              variant={"contained"}
              onClick={handleResetPassword}
              sx={{ marginBottom: "2rem" }}>
              Reset
            </Button>
          </Box>
          <Dialog open={isDialogOpen} onClose={closeDialog}>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogContent>
              <DialogContentText>{dialogMsg}</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button component={Link} to="/login">
                Done
              </Button>
            </DialogActions>
          </Dialog>
        </Paper>
      </Grid>
      <Grid item xs={2} />
    </Grid>
  );
}

export default ResetPasswordPage;
