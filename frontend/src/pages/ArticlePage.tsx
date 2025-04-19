import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import ReactMarkdown from "react-markdown";

interface Article {
  title: string;
  content: string;
  image?: string;
  created_at?: string;
}

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await API.get("/articles/" + id);
        setArticle(res.data);
      } catch (err) {
        console.error("❌ Error cargando artículo:", err);
      }
    };
    fetchArticle();
  }, [id]);

  if (!article) return <div className="text-center mt-20 text-gray-500">Cargando artículo...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center px-4 py-8">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-lg p-6">
        {article.image && (
          <img
            src={article.image}
            alt="Portada"
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
        )}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
        {article.created_at && (
          <p className="text-sm text-gray-500 mb-6">
            Publicado el {new Date(article.created_at).toLocaleDateString("es-ES")}
          </p>
        )}
        <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}