import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h5" components="div">
          PeerPreasure
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
