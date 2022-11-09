import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";

function AlertAndDialog({
  alertMsg,
  isAlertOpen,
  alertDuration,
  closeAlert,
  isDialogOpen,
  dialogTitle,
  dialogText,
  buttonText,
  buttonLink,
}) {
  return (
    <Box>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={isAlertOpen}
        autoHideDuration={alertDuration}
        onClose={closeAlert}>
        <Alert severity="error" onClose={closeAlert}>
          {alertMsg}
        </Alert>
      </Snackbar>
      <Dialog open={isDialogOpen}>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText>{dialogText}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button component={Link} to={buttonLink} variant={"contained"} color={"secondary"}>
            {buttonText}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AlertAndDialog;
