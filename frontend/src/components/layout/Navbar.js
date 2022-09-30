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
import { useState } from "react";
import { URL_USER_SVC_LOGOUT, URL_USER_SVC } from "../../configs";
import { STATUS_CODE_OK } from "../../constants";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { fontSize } from "@mui/system";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const username = useSelector((state) => state.user.username);
  const navigate = useNavigate();

  const closeDialog = () => setIsDialogOpen(false);

  const closeAlert = () => setIsAlertOpen(false);

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

  const handleDelete = () => {
    setIsDialogOpen(true);
  };

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
      setIsDialogOpen(false);
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
                  <Typography sx={userFont}>{username}</Typography>
                </Stack>
              </Grid>
              <Grid item xs={1} display="flex" justifyContent="flex-end">
                <IconButton onClick={handleDelete} color="error">
                  <DeleteIcon />
                </IconButton>
                <Dialog open={isDialogOpen} onClose={closeDialog}>
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
                    <Button variant="outlined" onClick={closeDialog} color="secondary">
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
              <Typography sx={userFont}>@.com</Typography>
            </Stack>
          </MenuItem>
          <MenuItem>
            <Button variant={"outlined"} sx={{ margin: 1 }} color={"secondary"}>
              Reset Password
            </Button>
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
