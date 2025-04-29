import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import API from "../api/axios";
import { useTheme } from "../theme/ThemeContext";

export default function ProfileSection() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState("");
  const [profileImage, setProfileImage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    API.get("/profile").then(res => {
      setValue("first_name", res.data.first_name || "");
      setValue("last_name", res.data.last_name || "");
      setValue("bio", res.data.bio || "");
      setProfileImage(res.data.profile_image || "");
      setLoading(false);
    });
  }, [setValue]);

  const onSubmit = async (data: any) => {
    setServerError("");
    try {
      await API.put("/profile", { ...data, profile_image: profileImage });
      alert("Perfil actualizado correctamente");
    } catch (e: any) {
      setServerError(e?.response?.data || "Error inesperado");
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const formData = new FormData();
    formData.append("file", e.target.files[0]);
    const res = await API.post("/upload/profile-image", formData, { headers: { "Content-Type": "multipart/form-data" } });
    setProfileImage(res.data.url);
  };

  if (loading) return <div className="text-center py-20 text-lg text-gray-400">Cargando perfil...</div>;

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`w-full max-w-xl p-8 rounded-2xl shadow-lg space-y-8 transition-colors duration-200
          ${theme === "dark" ? "bg-gray-900" : "bg-white"}`}
      >
        <h2 className={`text-2xl font-bold mb-4 ${theme === "dark" ? "text-gray-100" : "text-gray-800"}`}>Mi perfil</h2>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <img
              src={profileImage || "/avatar-placeholder.png"}
              alt="Avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-900 shadow"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute bottom-0 right-0 bg-blue-900 text-white rounded-full p-2 shadow-lg hover:bg-blue-800 transition-colors border-2 border-white ${theme === "dark" ? "border-gray-900" : "border-white"}`}
              title="Cambiar foto"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z"/></svg>
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Nombre</label>
            <input
              type="text"
              {...register("first_name", { required: "El nombre es obligatorio" })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors duration-150
                ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
            />
            {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message as string}</p>}
          </div>
          <div>
            <label className={`block font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Apellido</label>
            <input
              type="text"
              {...register("last_name", { required: "El apellido es obligatorio" })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors duration-150
                ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
            />
            {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message as string}</p>}
          </div>
        </div>
        <div>
          <label className={`block font-medium mb-1 ${theme === "dark" ? "text-gray-200" : "text-gray-700"}`}>Bio</label>
          <textarea
            rows={4}
            {...register("bio")}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors duration-150
              ${theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300 text-gray-900"}`}
          />
        </div>
        {serverError && <div className="text-red-600 text-center font-medium">{serverError}</div>}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors duration-150
            ${theme === "dark" ? "bg-blue-900 text-white hover:bg-blue-800" : "bg-blue-900 text-white hover:bg-blue-800"}`}
        >
          {isSubmitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
} 