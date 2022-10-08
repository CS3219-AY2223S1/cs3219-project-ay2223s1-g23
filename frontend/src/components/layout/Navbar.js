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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import { URL_USER_SVC_FORGET_PASSWORD } from "../../configs";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { STATUS_CODE_BAD_REQUEST, STATUS_CODE_OK } from "../../constants";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [isSuccessDialog, setIsSuccessDialog] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMsg, setDialogMsg] = useState("");
  const username = useSelector((state) => state.user.username);
  const navigate = useNavigate();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };

  function removeCookie(cname) {
    let expires = "expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = cname + "=;" + expires + "path=/";
  }

  const handleLogout = async () => {
    removeCookie("token");
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

  const renderMenu = () => {
    if (!document.cookie.includes("token")) {
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
                  <Typography>name</Typography>
                </Stack>
              </Grid>
              <Grid item xs={1} display="flex" justifyContent="flex-end">
                <IconButton color="error">
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          </MenuItem>
          <MenuItem>
            <Stack spacing={1}>
              <Typography>Email</Typography>
              <Typography>@.com</Typography>
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
              PeerPreasure
            </Typography>
          </Grid>
          <Grid item xs={1} display="flex" justifyContent="flex-end">
            {renderMenu()}
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
