import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import NavBar from "../components/NavBar";

export default function Home() {
  const { t, i18n } = useTranslation();

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white">
      <NavBar />
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

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Button
            size="lg"
            className="text-lg px-6 py-4 shadow-xl"
            onClick={() => {
              const nextLang = i18n.language === "en" ? "es" : "en";
              i18n.changeLanguage(nextLang);
            }}
          >
            {t("explore")} <ArrowRight className="ml-2" />
          </Button>
        </motion.div>
      </section>
    </main>
  );
}
