import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { Mail, Send } from "lucide-react"; // 👈 Importamos los íconos

export default function ContactForm() {
  return (
    <motion.section
      id="contact-section"
      className="container mx-auto px-6 py-20 text-center"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Ícono como título */}
      <motion.div
        className="flex justify-center mb-6"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Mail className="w-16 h-16 text-blue-400" />
      </motion.div>

      {/* Formulario */}
      <motion.form
        className="flex flex-col items-center gap-6 max-w-md mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <motion.input
          type="text"
          placeholder="Tu Nombre"
          className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.input
          type="email"
          placeholder="Tu Email"
          className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        />
        <motion.textarea
          placeholder="Tu Mensaje"
          rows={5}
          className="w-full p-3 rounded-xl bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />

        {/* Botón solo con ícono */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button size="lg" className="w-full shadow-lg flex justify-center items-center gap-2">
            <Send className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.form>
    </motion.section>
  );
}
