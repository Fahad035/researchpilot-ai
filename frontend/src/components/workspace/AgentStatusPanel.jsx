import { useMemo } from "react";

import {
  CheckCircle2,
  Loader2,
  Clock3,
  AlertTriangle,
  Bot,
} from "lucide-react";

const AGENTS = [
  {
    key: "planner",
    name: "Planner Agent",
  },
  {
    key: "paper_search",
    name: "Paper Search",
  },
  {
    key: "summary",
    name: "Summary Agent",
  },
  {
    key: "github",
    name: "GitHub Agent",
  },
  {
    key: "comparison",
    name: "Comparison Agent",
  },
  {
    key: "citation",
    name: "Citation Agent",
  },
  {
    key: "report",
    name: "Report Agent",
  },
];

export default function AgentStatusPanel({

  agentStates,

  activeAgentConsole,

  setActiveAgentConsole,

  loading,

}) {

  const progress = useMemo(() => {

  if (!agentStates) return 0;

  const completed = Object.values(agentStates).filter(
    (a) => a?.status === "completed"
  ).length;

  return Math.round((completed / AGENTS.length) * 100);

}, [agentStates]);

  const renderStatusIcon = (status) => {

    switch (status) {

      case "running":

        return (
          <Loader2
            size={16}
            className="animate-spin text-blue-400"
          />
        );

      case "completed":

        return (
          <CheckCircle2
            size={16}
            className="text-emerald-400"
          />
        );

      case "failed":

        return (
          <AlertTriangle
            size={16}
            className="text-red-400"
          />
        );

      default:

        return (
          <Clock3
            size={16}
            className="text-zinc-500"
          />
        );

    }

  };

  const activeLog =
    agentStates?.[activeAgentConsole]?.log ||
    "Waiting for execution...";

  return (

    <div
      className="
      w-[360px]
      border-r
      border-zinc-800
      bg-zinc-950/60
      backdrop-blur-xl
      flex
      flex-col
      overflow-hidden
    "
    >

      {/* Header */}

      <div className="p-5 border-b border-zinc-800">

        <div className="flex items-center gap-2">

          <Bot
            size={20}
            className="text-blue-400"
          />

          <h2 className="font-bold">
            Agent Pipeline
          </h2>

        </div>

        <div className="mt-5">

          <div className="flex justify-between text-xs mb-2">

            <span className="text-zinc-400">
              Progress
            </span>

            <span className="text-blue-400 font-semibold">
              {progress}%
            </span>

          </div>

          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">

            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </div>

      </div>

      {/* Agent List */}

      <div className="overflow-y-auto">

        {AGENTS.map((agent) => {

          const state =
            agentStates?.[agent.key] || {};

          const active =
            activeAgentConsole === agent.key;

          return (

            <button

              key={agent.key}

              onClick={() =>
                setActiveAgentConsole(agent.key)
              }

              className={`
                w-full
                px-5
                py-4
                flex
                items-center
                justify-between
                transition
                border-b
                border-zinc-900

                ${
                  active
                    ? "bg-blue-500/10"
                    : "hover:bg-zinc-900/50"
                }
              `}
            >

              <div className="flex items-center gap-3">

                {renderStatusIcon(state.status)}

                <div className="text-left">

                  <p className="font-medium text-sm">
                    {agent.name}
                  </p>

                  <p className="text-xs text-zinc-500">

                    {state.status || "waiting"}

                  </p>

                </div>

              </div>

            </button>

          );

        })}

      </div>

      {/* Console */}

      <div
        className="
        border-t
        border-zinc-800
        bg-black/40
        h-[320px]
        flex
        flex-col
      "
      >

        <div className="px-5 py-3 border-b border-zinc-800">

          <h3 className="font-semibold text-sm">

            Live Console

          </h3>

        </div>

        <div
          className="
          flex-1
          overflow-y-auto
          p-4
        "
        >

          <pre
            className="
            whitespace-pre-wrap
            break-words
            text-xs
            text-zinc-300
            leading-6
            font-mono
          "
          >

            {loading
              ? activeLog
              : activeLog || "No logs available."}

          </pre>

        </div>

      </div>

    </div>

  );

}