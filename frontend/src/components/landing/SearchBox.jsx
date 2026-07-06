import { useState } from "react";
import { Search, Play } from "lucide-react";

export default function SearchBox({
    topic,
    setTopic,
    loading,
    onStartResearch
}) {


  const handleSubmit = () => {
    if (!topic.trim()) return;

    onStartResearch(topic);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl">

      <div
        className="
        rounded-2xl
        border border-zinc-800
        bg-zinc-900/40
        backdrop-blur-xl
        p-3
        flex
        items-center
        gap-3
      "
      >
        <Search
          size={22}
          className="text-zinc-500 ml-2"
        />

        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter your research topic..."
          className="
          flex-1
          bg-transparent
          outline-none
          text-white
          placeholder:text-zinc-500
          text-lg
        "
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="
          flex
          items-center
          gap-2
          bg-blue-600
          hover:bg-blue-500
          px-5
          py-3
          rounded-xl
          transition
          disabled:opacity-50
        "
        >
          <Play size={18} />

          {loading ? "Starting..." : "Start Research"}
        </button>
      </div>

      <p className="text-center text-zinc-500 mt-4 text-sm">
        Example:
        <span className="text-zinc-300">
          {" "}
          Multi-Agent AI Systems for Scientific Research
        </span>
      </p>

    </div>
  );
}