import { AnimatePresence, motion } from "framer-motion";

import MarkdownRenderer from "../common/MarkdownRenderer";

const tabs = [
  {
    key: "plan",
    title: "Planner",
    field: "plan",
    agent: "planner",
  },
  {
    key: "papers",
    title: "Papers",
    field: "papers",
    agent: "paper_search",
  },
  {
    key: "summary",
    title: "Summary",
    field: "summary",
    agent: "summary",
  },
  {
    key: "github",
    title: "GitHub",
    field: "github",
    agent: "github",
  },
  {
    key: "comparison",
    title: "Comparison",
    field: "comparison",
    agent: "comparison",
  },
  {
    key: "report",
    title: "Final Report",
    field: "report",
    agent: "report",
  },
];

export default function ResultsViewer({

  activeTab,

  setActiveTab,

  activeSession,

  agentStates,

}) {

  const getContent = (tab) => {

    if (
      activeSession &&
      activeSession[tab.field]
    ) {

      return activeSession[tab.field];

    }

    return (
      agentStates?.[tab.agent]?.log ||
      ""
    );

  };

  return (

    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Tabs */}

      <div
        className="
        flex
        gap-2
        border-b
        border-zinc-800
        bg-zinc-950/40
        p-3
        overflow-x-auto
      "
      >

        {tabs.map((tab) => {

          const enabled =
            getContent(tab).trim().length > 0;

          return (

            <button

              key={tab.key}

              disabled={!enabled}

              onClick={() =>
                setActiveTab(tab.key)
              }

              className={`
                px-4
                py-2
                rounded-xl
                text-sm
                whitespace-nowrap
                transition

                ${
                  activeTab === tab.key
                    ? "bg-blue-600 text-white"
                    : enabled
                    ? "bg-zinc-900 text-zinc-300 hover:bg-zinc-800"
                    : "bg-zinc-950 text-zinc-600 cursor-not-allowed"
                }
              `}
            >

              {tab.title}

            </button>

          );

        })}

      </div>

      {/* Viewer */}

      <div
        className="
        flex-1
        overflow-y-auto
        bg-[#070709]
        p-8
      "
      >

        <AnimatePresence mode="wait">

          <motion.div

            key={activeTab}

            initial={{
              opacity: 0,
              y: 8,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            exit={{
              opacity: 0,
              y: -8,
            }}

            transition={{
              duration: 0.2,
            }}

            className="
            max-w-5xl
            mx-auto
          "

          >
                        {/* Planner */}

            {activeTab === "plan" && (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Research Execution Plan
                </h2>

                <MarkdownRenderer
                  content={getContent(tabs[0])}
                />
              </>
            )}

            {/* Papers */}

            {activeTab === "papers" && (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Academic Papers
                </h2>

                <MarkdownRenderer
                  content={getContent(tabs[1])}
                />
              </>
            )}

            {/* Summary */}

            {activeTab === "summary" && (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Literature Summary
                </h2>

                <MarkdownRenderer
                  content={getContent(tabs[2])}
                />
              </>
            )}

            {/* GitHub */}

            {activeTab === "github" && (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  GitHub Repositories
                </h2>

                <MarkdownRenderer
                  content={getContent(tabs[3])}
                />
              </>
            )}

            {/* Comparison */}

            {activeTab === "comparison" && (
              <>
                <h2 className="text-2xl font-bold mb-6">
                  Research Comparison
                </h2>

                <MarkdownRenderer
                  content={getContent(tabs[4])}
                />
              </>
            )}

            {/* Final Report */}

            {activeTab === "report" && (
              <>

                <h2 className="text-2xl font-bold mb-6">
                  Final Technical Report
                </h2>

                <MarkdownRenderer
                  content={getContent(tabs[5])}
                />

                {(activeSession?.citations ||
                  agentStates?.citation?.log) && (

                  <div
                    className="
                    mt-10
                    border-t
                    border-zinc-800
                    pt-8
                  "
                  >

                    <h3 className="text-xl font-semibold mb-5">
                      References
                    </h3>

                    <div
                      className="
                      rounded-xl
                      border
                      border-zinc-800
                      bg-zinc-900/40
                      p-5
                    "
                    >

                      <MarkdownRenderer
                        content={
                          activeSession?.citations ||
                          agentStates?.citation?.log
                        }
                      />

                    </div>

                  </div>

                )}

              </>
            )}
          </motion.div>
          </AnimatePresence>

      </div>

    </div>

  );

}