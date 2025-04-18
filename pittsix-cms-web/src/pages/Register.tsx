import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8080/auth/register", { email, password });
      alert("Usuario creado. Ahora podés iniciar sesión.");
    } catch {
      alert("Error al registrarse");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20">
      <h2 className="text-2xl font-bold mb-4">Registro</h2>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Correo electrónico" className="block w-full mb-2 p-2 border" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" className="block w-full mb-2 p-2 border" />
      <button type="submit" className="bg-green-600 text-white px-4 py-2">Registrarse</button>
    </form>
  );
}