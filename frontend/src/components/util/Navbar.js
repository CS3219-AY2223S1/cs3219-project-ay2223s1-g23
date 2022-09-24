import { AppBar, Toolbar, Typography, Menu, MenuItem, IconButton, Button } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DeleteIcon from "@mui/icons-material/Delete";
import React, { useState } from "react";

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" components="div">
          PeerPreasure
        </Typography>
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
            <Typography>Name</Typography>
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </MenuItem>
          <MenuItem>
            <Typography>Email</Typography>
          </MenuItem>
          <MenuItem>
            <Button variant={"outlined"} color={"secondary"}>
              Reset Password
            </Button>
            <Button variant={"contained"}>Logout</Button>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
