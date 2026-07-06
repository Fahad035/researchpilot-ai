import React from "react";

import {
    Globe,
    Cpu
} from "lucide-react";

export default function Footer() {

    const year = new Date().getFullYear();

    return (

        <footer className="border-t border-zinc-900 bg-[#070709] px-6 py-4 screen-only">

            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row">

                {/* Left */}

                <div>

                    <h3 className="font-outfit text-sm font-bold text-white">

                        ResearchPilot AI

                    </h3>

                    <p className="mt-1 text-xs text-zinc-500">

                        Multi-Agent Research Assistant powered by

                        Google Gemini • ADK • MCP

                    </p>

                </div>

                {/* Center */}

                <div className="flex items-center gap-5 text-xs text-zinc-500">

                    <div className="flex items-center gap-2">

                        <Cpu size={14} />

                        Gemini 2.5 Flash

                    </div>

                    <div className="h-4 w-px bg-zinc-800" />

                    <div>

                        Google ADK

                    </div>

                    <div className="h-4 w-px bg-zinc-800" />

                    <div>

                        MCP Protocol

                    </div>

                </div>

                {/* Right */}

                <div className="flex items-center gap-4">

                    <a

                        href="https://github.com"

                        target="_blank"

                        rel="noreferrer"

                        className="text-zinc-500 transition hover:text-white"

                        title="GitHub"

                    >

                        <span>Github</span>

                    </a>

                    <a

                        href="https://ai.google.dev"

                        target="_blank"

                        rel="noreferrer"

                        className="text-zinc-500 transition hover:text-white"

                        title="Google AI"

                    >

                        <Globe size={18} />

                    </a>

                </div>

            </div>

            <div className="mt-5 border-t border-zinc-900 pt-3 text-center text-[11px] text-zinc-600">

                © {year} ResearchPilot AI

                · Built using Google Gemini, Agent Development Kit (ADK), and Model Context Protocol (MCP).

            </div>

        </footer>

    );

}