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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);
  const [tempOpen, setTempOpen] = useState(false);
  const alwaysFalse = false;

  useEffect(() => {
    console.log("useEffect open : " + open);
    console.log("useEffect tempOpen : " + tempOpen);
    console.log("useEffect alwaysFalse : " + alwaysFalse);
    if (!open) setOpen(false);
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    // console.log("before : " + tempOpen);
    setOpen(true);
    // console.log("After :" + tempOpen);
  };
  const handleClose = () => {
    setAnchorEl(null);
    // console.log("before closing : " + tempOpen);
    setOpen(false);
    // console.log("after closing :" + tempOpen);
  };
  //const open = Boolean(anchorEl);
  function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  const navigate = useNavigate();
  const handleLogout = async () => {
    const token = "";
    setCookie("token", token, 0);
    console.log(document.cookie);
    navigate("/login");
  };
  const renderMenu = () => {
    if (document.cookie) {
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
    }
    return;
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
