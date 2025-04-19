import { useEffect, useState } from "react";
import API from "../api/axios";
import ReactMarkdown from "react-markdown";

interface Article {
  id: string;
  title: string;
  content: string;
  author_id: number;
  created_at: string;
  image?: string; // 👈 agregamos image opcional
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    API.get("/articles").then((res) => setArticles(res.data));
  }, []);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Artículos</h1>
      {articles.map((a) => (
        <div key={a.id} className="mb-4 border p-4 rounded">
          <h2 className="text-xl font-semibold">{a.title}</h2>
          <p className="text-sm text-gray-500">Autor ID: {a.author_id}</p>
          {a.image && (
            <img
              src={a.image}
              alt={a.title}
              className="my-2 max-h-60 object-contain border"
            />
          )}
          <div className="prose prose-lg max-w-none text-gray-800 leading-relaxed">
                    <ReactMarkdown>{a.content}</ReactMarkdown>
                  </div>
        </div>
      ))}
    </div>
  );
}
