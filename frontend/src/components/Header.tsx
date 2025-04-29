import { useAuth } from "../auth/AuthContext";
import { useTheme } from "../theme/ThemeContext";

export default function Header() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  return (
    <header className={`h-16 flex items-center justify-between px-8 border-b transition-colors duration-200
      ${theme === "dark" ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}>
      <div className={`text-xl font-semibold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Dashboard</div>
      <div className="flex items-center space-x-4">
        <span className={`font-medium ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>{user?.name || "Usuario"}</span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold
          ${theme === "dark" ? "bg-gray-700 text-gray-200" : "bg-gray-300 text-gray-600"}`}>
          {user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <button
          onClick={logout}
          className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-colors duration-150
            ${theme === "dark" ? "bg-red-700 text-white hover:bg-red-800" : "bg-red-500 text-white hover:bg-red-600"}`}
        >
          Logout
        </button>
      </div>
    </header>
  );
} 