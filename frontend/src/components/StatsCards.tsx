import { Book, Users, File } from "lucide-react";
import { useTheme } from "../theme/ThemeContext";

export default function StatsCards({ data = {} }: { data?: Record<string, any> }) {
  const { theme } = useTheme();
  const stats = [
    {
      label: "Artículos",
      value: 0,
      icon: Book,
      color: theme === "dark"
        ? "bg-blue-900 text-blue-200"
        : "bg-blue-100 text-blue-700"
    },
    {
      label: "Usuarios",
      value: 0,
      icon: Users,
      color: theme === "dark"
        ? "bg-green-900 text-green-200"
        : "bg-green-100 text-green-700"
    },
    {
      label: "Archivos",
      value: 0,
      icon: File,
      color: theme === "dark"
        ? "bg-purple-900 text-purple-200"
        : "bg-purple-100 text-purple-700"
    },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
      {stats.map(({ label, icon: Icon, color }) => (
        <div key={label} className={`rounded-xl shadow p-6 flex items-center space-x-4 transition-colors duration-200
          ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
          <div className={`w-14 h-14 flex items-center justify-center rounded-lg text-2xl ${color}`}>
            <Icon size={28} />
          </div>
          <div>
            <div className={`text-2xl font-bold `}>{data[label.toLowerCase()] ?? 0}</div>
            <div className={`text-gray-500 font-medium`}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
} 