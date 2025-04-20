import { Link } from "react-router-dom";
import { LanguageSelector } from "./LanguageSelector";

export default function Navbar() {
  return (
    <header className="bg-gray-950 text-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tight text-blue-400 hover:text-blue-300 transition">
          PittSix
        </Link>

        {/* Navegación */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/dashboard" className="hover:text-blue-400 transition">Dashboard</Link>
          <Link to="/articles" className="hover:text-blue-400 transition">Artículos</Link>
          <Link to="/about" className="hover:text-blue-400 transition">Acerca</Link>
        </nav>

        {/* Idiomas */}
        <div className="flex items-center">
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
}
