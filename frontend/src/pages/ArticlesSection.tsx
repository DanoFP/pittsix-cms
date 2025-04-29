import { useEffect, useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import { useTheme } from "../theme/ThemeContext";

interface Article {
  id: string;
  title: string;
  content: string;
  image?: string;
  created_at?: string;
}

export default function ArticlesSection() {
  const [articles, setArticles] = useState<Article[]>([]);
  const navigate = useNavigate();
  const { theme } = useTheme();

  const fetchArticles = async () => {
    const res = await API.get("/my-articles");
    const normalized = res.data.map((a: any) => ({
      ...a,
      id: a._id?.$oid || a._id || a.id,
    }));
    setArticles(normalized);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que querés eliminar este artículo?")) return;
    await API.delete("/articles/" + id);
    fetchArticles();
  };

  const handleCopyLink = (articleId: string) => {
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/articles/${articleId}`;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(fullUrl)
        .then(() => alert("Link copiado al portapapeles!"))
        .catch((err) => console.error("Error copiando:", err));
    } else {
      const input = document.createElement("input");
      input.value = fullUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      alert("Link copiado (fallback)");
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Mis artículos</h2>
        <button
          onClick={() => navigate("/articles/create")}
          className={`px-5 py-2 rounded-lg font-semibold transition-colors duration-150
            ${theme === "dark" ? "bg-blue-900 text-white hover:bg-blue-800" : "bg-blue-900 text-white hover:bg-blue-800"}`}
        >
          Crear artículo
        </button>
      </div>
      <div className={`overflow-x-auto rounded-xl shadow transition-colors duration-200
        ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}>
        <table className="min-w-full">
          <thead>
            <tr>
              <th className={`px-6 py-3 text-left font-semibold text-sm uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Título</th>
              <th className={`px-6 py-3 text-left font-semibold text-sm uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Fecha</th>
              <th className={`px-6 py-3 text-left font-semibold text-sm uppercase tracking-wider ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <tr key={a.id} className={theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-50"}>
                <td className={`px-6 py-4 font-medium ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>{a.title}</td>
                <td className={`px-6 py-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{a.created_at ? format(new Date(a.created_at), "dd/MM/yyyy") : ""}</td>
                <td className="px-6 py-4 space-x-2">
                  <button
                    onClick={() => navigate(`/articles/edit/${a.id}`)}
                    className={`px-3 py-1 rounded-lg font-semibold text-sm transition-colors duration-150
                      ${theme === "dark" ? "bg-gray-800 text-blue-200 hover:bg-blue-900" : "bg-gray-100 text-blue-900 hover:bg-blue-900 hover:text-white"}`}
                  >Editar</button>
                  <button
                    className={`px-3 py-1 rounded-lg font-semibold text-sm transition-colors duration-150
                      ${theme === "dark" ? "bg-gray-800 text-red-300 hover:bg-red-900" : "bg-gray-100 text-red-700 hover:bg-red-700 hover:text-white"}`}
                  >Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 