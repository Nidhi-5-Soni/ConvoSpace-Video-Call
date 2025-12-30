import * as React from "react";
import { AuthContext } from "../contexts/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import { useNavigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import LockIcon from "@mui/icons-material/Lock";
import Typography from "@mui/material/Typography";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme();

export default function Authentication() {
  const navigate = useNavigate();
  const { handleRegister, handleLogin } = React.useContext(AuthContext);

  const [username, setUsername] = React.useState("");
  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        await handleLogin(username, password);
        navigate("/home");
      } else {
        const res = await handleRegister(name, username, password);
        setMessage(res);
        setOpen(true);
        setFormState(0);
        setUsername("");
        setPassword("");
        setName("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid
        container
        component="main"
        sx={{
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage:
            "url(https://source.unsplash.com/random?wallpapers)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <CssBaseline />

        <Grid component={Paper} elevation={6} sx={{ p: 4, width: 380 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Avatar sx={{ mb: 1, bgcolor: "secondary.main" }}>
              <LockIcon />
            </Avatar>

            <Typography variant="h6" mb={2}>
              {formState === 0 ? "Sign In" : "Sign Up"}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                variant={formState === 0 ? "contained" : "outlined"}
                onClick={() => setFormState(0)}
              >
                Sign In
              </Button>
              <Button
                variant={formState === 1 ? "contained" : "outlined"}
                onClick={() => setFormState(1)}
              >
                Sign Up
              </Button>
            </Box>

            {formState === 1 && (
              <TextField
                fullWidth
                margin="normal"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}

            <TextField
              fullWidth
              margin="normal"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 2 }}
              onClick={handleAuth}
            >
              {formState === 0 ? "Login" : "Register"}
            </Button>
          </Box>
        </Grid>

        <Snackbar
          open={open}
          autoHideDuration={4000}
          message={message}
          onClose={() => setOpen(false)}
        />
      </Grid>
    </ThemeProvider>
  );
}
