import { Book, Users, File } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

const stats = [
  { label: "Artículos", value: 0, icon: Book, color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200" },
  { label: "Usuarios", value: 0, icon: Users, color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200" },
  { label: "Archivos", value: 0, icon: File, color: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200" },
];

export default function StatsCards({ data = {} }) {
  const { theme } = useTheme();
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {stats.map(({ label, icon: Icon, color }) => (
        <div key={label} className={`rounded-xl shadow p-6 flex items-center space-x-4 transition-colors duration-200
          ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
          <div className={`w-14 h-14 flex items-center justify-center rounded-lg text-2xl ${color}`}>
            <Icon size={28} />
          </div>
          <div>
            <div className={`text-2xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{data[label.toLowerCase()] ?? 0}</div>
            <div className={`text-gray-500 font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 