import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await API.get("/articles/" + id);
        setTitle(res.data.title || "");
        setContent(res.data.content || "");
        setImage(res.data.image || "");
      } catch (err) {
        console.error("❌ Error al cargar el artículo:", err);
      }
    };
    if (id) fetchArticle();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.put("/articles/" + id, {
        title,
        content,
        image,
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("❌ Error al actualizar el artículo:", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">✏️ Editar artículo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <textarea
          placeholder="Contenido (Markdown)"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <input
          type="text"
          placeholder="URL de imagen"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
        >
          💾 Guardar cambios
        </button>
      </form>
    </div>
  );
}