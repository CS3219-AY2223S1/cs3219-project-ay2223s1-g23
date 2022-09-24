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

function ResetPasswordPage() {
  const [username, setUsername] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");

  const handleResetPassword = async () => {
    const res = await axios.post(URL_USER_SVC, { username }).catch((err) => {
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setErrorDialog("ERROR: " + err.response.data.message);
      } else {
        setErrorDialog("Please try again later");
      }
    });
    if (res && res.status === STATUS_CODE_CREATED) {
      setSuccessDialog("Password reset link has been sent to your email");
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
        <Box display={"flex"} alignItems={"center"} justifyContent={"center"}>
          <Typography variant={"h3"} m={"1rem"}>
            Reset Password
          </Typography>
        </Box>
        <Paper elevation={3} sx={{ width: "65%", margin: "auto" }}>
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
                    sx={{ margin: "1rem" }}
                    autoFocus
                  />
                </TableCell>
              </TableRow>
            </Table>
          </Container>
        </Paper>
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"center"}
          justifyContent={"center"}>
          <Button variant={"contained"} onClick={handleResetPassword} sx={{ margin: "2rem" }}>
            Reset
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
      </Grid>
      <Grid item xs={2} />
    </Grid>
  );
}

export default ResetPasswordPage;