import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import {
  UsersList, UserForm, UserDetail,
  OrganizationsList, OrganizationForm, OrganizationDetail,
  ProfileView, ProfileEdit,
  ArticlesList, ArticleForm, ArticleDetail,
  ForgotPassword, ResetPassword, NotFound
} from "./pages";
import { AuthProvider } from "./auth/AuthContext";
import PrivateRoute from "./auth/PrivateRoute";
import './i18n' // 👈 Importante
import PublicArticleDetail from "./pages/Articles/ArticleDetail";
import { HelmetProvider } from 'react-helmet-async';

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/article/:id" element={<PublicArticleDetail />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
              <Route path="users" element={<UsersList />} />
              <Route path="users/new" element={<UserForm />} />
              <Route path="users/:id" element={<UserDetail />} />
              <Route path="organizations" element={<OrganizationsList />} />
              <Route path="organizations/new" element={<OrganizationForm />} />
              <Route path="organizations/:id" element={<OrganizationDetail />} />
              <Route path="profile" element={<ProfileView />} />
              <Route path="profile/edit" element={<ProfileEdit />} />
              <Route path="articles" element={<ArticlesList />} />
              <Route path="articles/new" element={<ArticleForm />} />
              <Route path="articles/:id" element={<ArticleDetail />} />
              <Route path="articles/slug/:slug" element={<ArticleDetail />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;