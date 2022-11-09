import {
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Button,
  Grid,
  Stack,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
} from "@mui/material";
import axios from "axios";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import { URL_USER_SVC_FORGET_PASSWORD, URL_USER_SVC_LOGOUT, URL_USER_SVC } from "../../configs";
import { useState, useContext } from "react";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../../constants";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { fontSize } from "@mui/system";
import { removeCookie, getCookie } from "../../util/cookies";
import decodedJwt from "../../util/decodeJwt";
import useAuth from "../../util/auth/useAuth";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [isSuccessDialog, setIsSuccessDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const decodedToken = decodedJwt();
  const username = decodedToken.username;
  const email = decodedToken.email;
  const navigate = useNavigate();
  const auth = useAuth();

  const closeDialog = () => setIsDialogOpen(false);

  const closeDeleteDialog = () => setIsDeleteDialogOpen(false);

  const closeAlert = () => setIsAlertOpen(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  const handleLogout = async () => {
    removeCookie("token");
    auth.logout();
    navigate("/login");
    window.location.reload();
  };

  const handleResetPassword = async () => {
    const res = await axios.post(URL_USER_SVC_FORGET_PASSWORD, { username }).catch((err) => {
      setIsSuccessDialog(false);
      if (err.response.status === STATUS_CODE_BAD_REQUEST) {
        setErrorDialog("ERROR: " + err.response.data.message);
      } else {
        setErrorDialog("Please try again later");
      }
    });
    if (res && res.status === STATUS_CODE_OK) {
      setIsSuccessDialog(true);
      setSuccessDialog("Password reset link has been sent to your email");
    }
  };

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

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    const token = getCookie("token");
    console.log(token);
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const res = await axios.delete(URL_USER_SVC + "/" + username, config).catch((err) => {
      console.log(err);
      setAlertMsg(err.response.data.message);
      setIsAlertOpen(true);
      setIsDeleteDialogOpen(false);
    });
    if (res && res.status === STATUS_CODE_OK) {
      removeCookie("token");
      navigate(`/signup`);
      window.location.reload();
    }
  };

  const userFont = {
    fontWeight: "bold",
    fontSize: 21,
  };

  const renderMenu = () => {
    if (!auth.isLogin) {
      return;
    }

    return (
      <Box>
        <IconButton
          id="account-button"
          onClick={handleClick}
          aria-controls={open ? "account" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true">
          <MenuIcon />
        </IconButton>
        <Menu
          id="account"
          MenuListProps={{
            "aria-labelledby": "account-button",
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}>
          <MenuItem>
            <Grid container>
              <Grid item xs={11}>
                <Stack spacing={1}>
                  <Typography>Username</Typography>
                  <Typography sx={userFont}>{username}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={1} display="flex" justifyContent="flex-end">
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
                <Dialog open={isDeleteDialogOpen} onClose={closeDialog}>
                  <DialogTitle>Warning</DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                      Are you sure you want to delete this account?
                    </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                    <Button variant="contained" onClick={handleConfirmDelete} color="error">
                      Delete
                    </Button>
                    <Button variant="outlined" onClick={closeDeleteDialog} color="secondary">
                      Cancle
                    </Button>
                  </DialogActions>
                </Dialog>
              </Grid>
            </Grid>
          </MenuItem>
          <MenuItem>
            <Stack spacing={1}>
              <Typography>Email</Typography>
              <Typography sx={userFont}>{email}</Typography>
            </Stack>
          </MenuItem>
          <MenuItem>
            <Button
              variant={"outlined"}
              onClick={handleResetPassword}
              color={"secondary"}
              sx={{ margin: 1 }}>
              Reset Password
            </Button>
            <Dialog open={isDialogOpen} onClose={closeDialog}>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogContent>
                <DialogContentText>{dialogMsg}</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button variant={"contained"} onClick={closeDialog} color={"secondary"}>
                  Done
                </Button>
              </DialogActions>
            </Dialog>
            <Button variant={"contained"} onClick={handleLogout} sx={{ margin: 1 }}>
              Logout
            </Button>
          </MenuItem>
        </Menu>
      </Box>
    );
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Grid container>
          <Grid item xs={11}>
            <Typography variant="h5" components="div">
              PeerPressure
            </Typography>
          </Grid>
          <Grid item xs={1} display="flex" justifyContent="flex-end">
            {renderMenu()}
          </Grid>
        </Grid>
      </Toolbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={isAlertOpen}
        autoHideDuration={4000}
        onClose={closeAlert}>
        <Alert severity="error" onClose={closeAlert}>
          {alertMsg}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
