import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useTheme } from "../theme/ThemeContext";

export default function CreateArticle() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const onSubmit = async (data: any) => {
    await API.post("/articles", data);
    navigate("/dashboard/articles");
  };

  return (
    <div className={`min-h-[80vh] flex items-center justify-center ${theme === "dark" ? "bg-gray-950" : "bg-gray-100"}`}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`w-full max-w-xl p-8 rounded-2xl shadow-lg space-y-6 transition-colors duration-200
          ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
      >
        <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Crear artículo</h2>
        <div>
          <label className={`block font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Título</label>
          <input
            type="text"
            {...register("title", { required: "El título es obligatorio" })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors duration-150
              ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message as string}</p>}
        </div>
        <div>
          <label className={`block font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Contenido</label>
          <textarea
            rows={8}
            {...register("content", { required: "El contenido es obligatorio" })}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors duration-150
              ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
          />
          {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message as string}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors duration-150
            ${theme === "dark" ? "bg-blue-900 text-white hover:bg-blue-800" : "bg-blue-900 text-white hover:bg-blue-800"}`}
        >
          {isSubmitting ? "Creando..." : "Crear artículo"}
        </button>
      </form>
    </div>
  );
}