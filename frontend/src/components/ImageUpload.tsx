import { useState } from "react";
import API from "../api/axios"; // 👈 usamos tu instancia configurada con JWT

interface Props {
  onUpload: (url: string) => void;
}

export default function ImageUpload({ onUpload }: Props) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await API.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // 👈 necesario para MinIO
        },
      });

      onUpload(res.data.url);
      setPreview(res.data.url);
    } catch {
      alert("Error uploading image");
    }
  };

  return (
    <div className="mb-4">
      <input type="file" accept="image/*" onChange={handleChange} />
      {preview && <img src={preview} alt="Preview" className="mt-2 max-h-40" />}
    </div>
  );
}
