import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Button } from "../components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Jumbotron3D() {
  const { t, i18n } = useTranslation();

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Background - Cielo estrellado */}
      <motion.img
        src="/assets/jumbotron/Pittsix 4k.png"
        alt="Background"
        className="absolute w-full h-full object-cover"
        style={{ zIndex: 1 }}
        initial={{ scale: 1 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 40, repeat: Infinity, repeatType: "mirror" }}
      />

      {/* Midground - Curvas de energía */}
      {/* <motion.img
        src="/assets/jumbotron/Pittsix 4k.png"
        alt="Midground"
        className="absolute w-4/5 md:w-3/4 object-contain"
        style={{ zIndex: 2 }}
        initial={{ y: 0 }}
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "mirror" }}
      /> */}

      {/* Foreground - Logo PittSix */}
      {/* <motion.img
        src="/assets/jumbotron/foreground1.png"
        alt="Foreground"
        className="absolute w-1/2 md:w-1/3 object-contain"
        style={{ zIndex: 3 }}
        initial={{ scale: 1 }}
        animate={{ scale: [1, 1.02, 1] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      /> */}

    </section>
  );
}
