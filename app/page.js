"use client";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Paper,
  Container,
  CssBaseline,
  InputAdornment,
  IconButton,
} from "@mui/material";
import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "../firebase.js";

const Page = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState('');

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: { main: "#e91e63" },
      secondary: { main: "#f06292" },
      background: { default: darkMode ? "#121212" : "#fce4ec" },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
    },
    shape: { borderRadius: 12 },
  });

  const handleLogin = () => {
    if (email && password) {
      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          setIsAuthenticated(true);
        })
        .catch((error) => {
          alert(`Error: ${error.message}`);
        });
    } else {
      alert("Please enter both email and password");
    }
  };

  const handleCreateAccount = () => {
    if (email && password) {
      createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert("Account created! You can now log in.");
          setIsCreatingAccount(false);
        })
        .catch((error) => {
          alert(`Error: ${error.message}`);
        });
    } else {
      alert("Please fill out all fields");
    }
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setIsAuthenticated(false);
        alert("You have been logged out.");
      })
      .catch((error) => {
        alert(`Error: ${error.message}`);
      });
  };

  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    setMessage("");
    const response = fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      return reader.read().then(function processText({ done, value }) {
        if (done) {
          return result;
        }
        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1];
          let otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
        return reader.read().then(processText);
      });
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container>
          <Box
            width="100%"
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor="background.default"
            px={2}
          >
            <Paper
              elevation={4}
              sx={{
                width: "100%",
                maxWidth: 600,
                p: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Box mb={2} textAlign="center">
                <Typography variant="h5" color="primary">
                  Welcome to Rate My Professor (AI Edition)
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  Your ultimate guide to choosing your perfect teacher.
                </Typography>
              </Box>

              <Box width="100%" mb={2}>
                <TextField
                  label="Email"
                  fullWidth
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="outlined"
                  margin="normal"
                />
                <TextField
                  label="Password"
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={togglePasswordVisibility} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Stack direction="row" spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  onClick={isCreatingAccount ? handleCreateAccount : handleLogin}
                >
                  {isCreatingAccount ? "Create Account" : "Login"}
                </Button>
                <Button onClick={() => setIsCreatingAccount(!isCreatingAccount)}>
                  {isCreatingAccount ? "Back to Login" : "Create an Account"}
                </Button>
              </Stack>
            </Paper>
          </Box>
          <Button
            onClick={toggleDarkMode}
            sx={{ position: "absolute", bottom: 16, right: 16 }}
          >
            Toggle Dark Mode
          </Button>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Stack
        direction={"column"}
        width="500px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={
                message.role === "assistant" ? "flex-start" : "flex-end"
              }
            >
              <Box
                bgcolor={
                  message.role === "assistant"
                    ? "primary.main"
                    : "secondary.main"
                }
                color="white"
                borderRadius={16}
                p={3}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
        <Stack direction={"row"} spacing={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button variant="contained" onClick={sendMessage}>
            Send
          </Button>
        </Stack>
        <Stack direction={"row"} spacing={2} mt={2} justifyContent="center">
          <Button variant="contained" onClick={handleLogout}>
            Logout
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default Page;
