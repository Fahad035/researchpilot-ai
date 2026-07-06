import { useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import Sidebar from "./Sidebar";
import AgentStatusPanel from "./AgentStatusPanel";
import ResultsViewer from "./ResultsViewer";

import {
    Download,
    FileText,
    RefreshCw
} from "lucide-react";

export default function Workspace({

    activeSession,

    agentStates,

    activeTab,

    setActiveTab,

    activeAgentConsole,

    setActiveAgentConsole,

    history,

    onSelectSession,

    onDeleteSession,

    loading

}) {

    const [exportOpen, setExportOpen] = useState(false);

    const exportMarkdown = () => {

        if (!activeSession?.report) return;

        const blob = new Blob(

            [activeSession.report],

            {
                type: "text/markdown"
            }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;

        a.download =
            `${activeSession.topic.replace(/\s+/g, "_")}.md`;

        document.body.appendChild(a);

        a.click();

        document.body.removeChild(a);

        URL.revokeObjectURL(url);

    };

    const exportPDF = () => {

        window.print();

    };

    return (

        <div className="flex flex-1 overflow-hidden">

            <Sidebar

                history={history}

                activeSession={activeSession}

                onSelectSession={onSelectSession}

                onDeleteSession={onDeleteSession}

            />

            <div className="flex-1 flex flex-col overflow-hidden">

                {/* Workspace Header */}

                <div
                    className="
                    h-16
                    border-b
                    border-zinc-800
                    bg-zinc-950/50
                    backdrop-blur-xl
                    px-6
                    flex
                    items-center
                    justify-between
                "
                >

                    <div>

                        <h2 className="text-lg font-bold">

                            {activeSession?.topic || "Research Workspace"}

                        </h2>

                        <p className="text-xs text-zinc-500">

                            Multi-Agent Execution Dashboard

                        </p>

                    </div>

                    <div className="flex items-center gap-3">

                        <button

                            className="
                            flex
                            items-center
                            gap-2
                            px-4
                            py-2
                            rounded-xl
                            bg-zinc-900
                            hover:bg-zinc-800
                            transition
                        "

                            onClick={() => setExportOpen(!exportOpen)}

                        >

                            <Download size={16} />

                            Export

                        </button>

                    </div>

                </div>

                {/* Export Menu */}

                <AnimatePresence>

                    {exportOpen && (

                        <motion.div

                            initial={{
                                opacity: 0,
                                y: -10
                            }}

                            animate={{
                                opacity: 1,
                                y: 0
                            }}

                            exit={{
                                opacity: 0,
                                y: -10
                            }}

                            className="
                            absolute
                            right-8
                            top-20
                            bg-zinc-900
                            border
                            border-zinc-800
                            rounded-xl
                            overflow-hidden
                            z-40
                            shadow-2xl
                        "

                        >

                            <button

                                onClick={exportMarkdown}

                                className="
                                w-full
                                px-5
                                py-3
                                flex
                                items-center
                                gap-3
                                hover:bg-zinc-800
                            "

                            >

                                <FileText size={16} />

                                Export Markdown

                            </button>

                            <button

                                onClick={exportPDF}

                                className="
                                w-full
                                px-5
                                py-3
                                flex
                                items-center
                                gap-3
                                hover:bg-zinc-800
                            "

                            >

                                <Download size={16} />

                                Export PDF

                            </button>

                        </motion.div>

                    )}

                </AnimatePresence>

                {/* Main Workspace */}

                <div className="flex flex-1 overflow-hidden">

                    <AgentStatusPanel

                        agentStates={agentStates}

                        activeAgentConsole={activeAgentConsole}

                        setActiveAgentConsole={
                            setActiveAgentConsole
                        }

                        loading={loading}

                    />

                    <ResultsViewer

                        activeTab={activeTab}

                        setActiveTab={setActiveTab}

                        activeSession={activeSession}

                        agentStates={agentStates}

                    />

                </div>

            </div>

        </div>

    );

}