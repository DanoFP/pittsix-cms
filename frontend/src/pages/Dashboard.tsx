import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

interface Article {
  id: string;
  title: string;
  content: string;
  image?: string;
  created_at?: string;
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const navigate = useNavigate();
  const { logout } = useAuth();

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
    const baseUrl = window.location.origin; // Ej: http://pittsix.com
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
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">📚 Mis artículos</h1>
        <div className="space-x-4">
          <button onClick={() => navigate("/articles/create")} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">📝 Nuevo</button>
          <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl">🔓 Salir</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {articles.map((a) => (
          <div key={a.id} className="bg-white shadow-md rounded-2xl p-4 space-y-2">
            {a.image && (
              <img src={a.image} alt={a.title} className="w-full h-48 object-cover rounded-xl" />
            )}
            <div className="text-sm text-gray-500">
              {a.created_at ? format(new Date(a.created_at), "dd MMM yyyy") : ""}
            </div>
            <h2 className="text-xl font-semibold">{a.title}</h2>
            <div >
                <ReactMarkdown>{a.content}</ReactMarkdown>
            </div>

            <div className="flex justify-end space-x-3 mt-2">
              <button onClick={() => navigate("/articles/edit/" + a.id)} className="text-blue-600 hover:underline">✏️ Editar</button>
              <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:underline">🗑️ Eliminar</button>
              <button onClick={() => handleCopyLink(a.id)} className="text-green-600 hover:underline">🔗 Compartir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}