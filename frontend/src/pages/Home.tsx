import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight, Contact } from "lucide-react";
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Jumbotron3D from "../components/Jumbotron3D";
import ContactForm from "../components/ContactForm";

export default function Home() {
  const { t, i18n } = useTranslation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      <NavBar />

      {/* Nuevo: Jumbotron3D */}
      <Jumbotron3D />

      {/* Sección principal - Hero */}
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {t("welcome", { brand: "PittSix" })}
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {t("description")}
        </motion.p>

        {/* Botón Explore que hace scroll suave */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="text-lg px-6 py-4 shadow-xl"
            onClick={() => {
              document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t("explore")} <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </section>

      {/* Sección Sobre Nosotros con ID */}
      <motion.section
        id="about-section"
        className="container mx-auto px-6 py-20 text-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-4xl md:text-5xl font-bold mb-6">Sobre Nosotros</h2>
        <p className="text-lg text-gray-300 max-w-3xl mx-auto">
          En PittSix creemos en construir soluciones digitales escalables y centradas en las personas.
        </p>
      </motion.section>

        
        {/* Sección de Form contact */}	
      <ContactForm />
      
      {/* Otras secciones seguirían normalmente */}
      {/* Servicios, Métricas, Contacto, etc... */}
    </main>
  );
}
