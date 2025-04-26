import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import API from "../api/axios";
import { useAuth } from "../auth/AuthContext";
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
  const [scrollY, setScrollY] = useState(0);

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
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col">

      {/* Hero Section with Parallax */}
      <div
        className="h-screen bg-cover bg-center flex items-center justify-center text-white text-5xl font-bold"
        style={{
          backgroundImage: "url('/your-hero-image.jpg')",
          backgroundPositionY: `${scrollY * 0.5}px`,
        }}
      >
        Tu Empresa
      </div>

      {/* Sobre Nosotros */}
      <motion.section
        className="min-h-screen flex flex-col justify-center items-center p-8 bg-white"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl mb-4 font-bold">Sobre Nosotros</h2>
        <p className="text-lg max-w-2xl text-center text-gray-600">
          Somos una empresa comprometida con la innovación y el crecimiento sostenible.
        </p>
      </motion.section>

      {/* Servicios con fondo parallax */}
      <div
        className="h-screen bg-fixed bg-center bg-cover flex flex-col items-center justify-center text-white p-8"
        style={{ backgroundImage: "url('/services-background.jpg')" }}
      >
        <motion.h2
          className="text-4xl mb-8 font-bold"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Servicios
        </motion.h2>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ scale: 0.8 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="bg-white text-black p-6 rounded-2xl shadow-lg">Producto 1</div>
          <div className="bg-white text-black p-6 rounded-2xl shadow-lg">Producto 2</div>
          <div className="bg-white text-black p-6 rounded-2xl shadow-lg">Producto 3</div>
        </motion.div>
      </div>

      {/* MÉTRICAS */}
      <motion.section
        className="min-h-screen flex flex-col justify-center items-center p-8 bg-gray-100"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl mb-8 font-bold">Nuestras Métricas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-5xl font-bold">+500</h3>
            <p>Clientes Satisfechos</p>
          </div>
          <div className="text-center">
            <h3 className="text-5xl font-bold">+20M</h3>
            <p>Ingresos Anuales</p>
          </div>
          <div className="text-center">
            <h3 className="text-5xl font-bold">10</h3>
            <p>Años de Experiencia</p>
          </div>
        </div>
      </motion.section>

      {/* Sección de Mis Artículos */}
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
              <div>
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

      {/* Contacto */}
      <motion.section
        className="min-h-screen flex flex-col justify-center items-center p-8 bg-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl mb-8 font-bold">Contáctanos</h2>
        <form className="flex flex-col w-full max-w-md gap-4">
          <input className="border p-3 rounded-xl" placeholder="Tu Nombre" />
          <input className="border p-3 rounded-xl" placeholder="Tu Email" />
          <textarea className="border p-3 rounded-xl" placeholder="Tu Mensaje" />
          <button className="bg-black text-white p-3 rounded-xl hover:bg-gray-800 transition">
            Enviar
          </button>
        </form>
      </motion.section>

    </div>
  );
}
