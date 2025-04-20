import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      <section className="container mx-auto px-6 py-20 text-center">
        <motion.h1
          className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Bienvenido a <span className="text-blue-400">PittSix</span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Un ecosistema exclusivo de élite para los profesionales más avanzados del software. 
          Aprendé, colaborá y construí el futuro con los mejores.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button size="lg" className="text-lg px-6 py-4 shadow-xl">
            Explorá el conocimiento <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
