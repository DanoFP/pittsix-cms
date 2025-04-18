import { useState } from "react";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload";

export default function CreateArticle() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/articles", { title, content, image });
      alert("Artículo publicado");
      navigate("/articles");
    } catch {
      alert("Error al publicar artículo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Crear artículo</h1>
      <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className="w-full border p-2 mb-2" />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Contenido" className="w-full border p-2 mb-2" />
      <ImageUpload onUpload={setImage} />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2">Publicar</button>
    </form>
  );
}