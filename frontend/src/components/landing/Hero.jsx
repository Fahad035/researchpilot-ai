import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function Hero() {
  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full
        bg-blue-500/10 border border-blue-500/20
        text-blue-400 text-xs font-semibold uppercase tracking-wider"
      >
        <Award size={14} />
        Kaggle Capstone Freestyle Entry
      </motion.div>

      <div className="space-y-5 text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-7xl font-black font-outfit tracking-tight
          bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent"
        >
          ResearchPilot AI
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="max-w-3xl mx-auto text-zinc-400 text-lg md:text-xl leading-relaxed"
        >
          Autonomous Multi-Agent Research Assistant powered by
          <span className="text-blue-400"> Google Gemini</span>,
          <span className="text-purple-400"> ADK</span> &
          <span className="text-cyan-400"> MCP Tools</span>.
        </motion.p>
      </div>
    </>
  );
}