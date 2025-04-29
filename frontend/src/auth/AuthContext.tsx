import { createContext, useContext, useState, useEffect } from "react";
import API from '../api/axios';

interface AuthContextType {
  token: string | null;
  user: any | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));
  const [user, setUser] = useState<any | null>(null);

  // Cargar usuario al iniciar o al loguear
  useEffect(() => {
    if (token) {
      API.get('/users/me')
        .then(res => setUser({
          name: res.data.first_name || res.data.firstName || '',
          email: res.data.email,
          avatar: res.data.profile_image || '',
          ...res.data
        }))
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [token]);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    // El usuario se cargará automáticamente por el useEffect
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}