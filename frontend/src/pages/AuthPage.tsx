import { useState } from "react";
import { useForm } from "react-hook-form";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  Box, Tabs, Tab, Typography, TextField, Button, Alert, Paper, Container
} from '@mui/material';

export default function AuthPage() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login: doLogin } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm();

  const onSubmit = async (data: any) => {
    setError("");
    try {
      if (tab === "login") {
        const res = await API.post("/auth/login", data);
        doLogin(res.data.token);
        navigate("/dashboard");
      } else {
        await API.post("/auth/register", data);
        setTab("login");
        reset();
      }
    } catch (e: any) {
      setError(e?.response?.data || "Error inesperado");
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={4}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 3 }}>
          Iniciar sesión
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            {...register("email", { required: "El email es obligatorio" })}
            error={!!errors.email}
            helperText={errors.email?.message as string}
            autoComplete="email"
          />
          <TextField
            label="Contraseña"
            type="password"
            fullWidth
            {...register("password", { required: "La contraseña es obligatoria" })}
            error={!!errors.password}
            helperText={errors.password?.message as string}
            autoComplete={tab === "login" ? "current-password" : "new-password"}
          />
          {tab === "register" && (
            <TextField
              label="Confirmar contraseña"
              type="password"
              fullWidth
              {...register("confirmPassword", {
                required: "Confirma tu contraseña",
                validate: (value: string) => value === watch("password") || "Las contraseñas no coinciden"
              })}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message as string}
              autoComplete="new-password"
            />
          )}
          {error && <Alert severity="error">{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 1, fontWeight: 600, letterSpacing: 1 }}
            fullWidth
          >
            {tab === "login" ? "Entrar" : "Registrarse"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
} 