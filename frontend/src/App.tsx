import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Articles from "./pages/Articles";
import ArticlePage from "./pages/ArticlePage";
import CreateArticle from "./pages/CreateArticle";
import EditArticle from "./pages/EditArticle";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:id" element={<ArticlePage />} />
          <Route path="/articles/create" element={<PrivateRoute><CreateArticle /></PrivateRoute>} />
          <Route path="/articles/edit/:id" element={<EditArticle />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;