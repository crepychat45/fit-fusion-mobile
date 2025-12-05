import React from "react";
import { MobileNav } from "@/components/mobile-nav";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { HolographicVault } from "@/components/vault/holographic-vault";
import { motion } from "framer-motion";

const Vault = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-16">
      <header className="fitness-gradient pt-12 pb-6 px-4">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white p-2 rounded-full hover:bg-white/10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-white ml-2">Holographic Vault</h1>
        </div>
        <p className="text-white/80 text-sm mt-2 ml-10">
          Secure document storage with encryption
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-4"
      >
        <HolographicVault />
      </motion.div>

      <MobileNav />
    </div>
  );
};

export default Vault;