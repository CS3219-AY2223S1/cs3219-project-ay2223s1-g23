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
import { useState } from "react";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };
  const renderMenu = () => {
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
            <Button variant={"contained"} sx={{ margin: 1 }}>
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
