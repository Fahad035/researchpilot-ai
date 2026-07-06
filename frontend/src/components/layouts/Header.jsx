import React from "react";

import {
    Cpu,
    ShieldCheck,
    Settings
} from "lucide-react";

export default function Header({

    envStatus,

    onOpenSettings,

    onLogoClick

}) {

    return (

        <header className="w-full py-4 px-6 border-b border-zinc-800/40 flex items-center justify-between glass-panel sticky top-0 z-50 screen-only">

            {/* Logo */}

            <div

                className="flex items-center gap-3 cursor-pointer"

                onClick={onLogoClick}

            >

                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">

                    <span className="font-bold text-white text-lg">

                        RP

                    </span>

                </div>

                <div>

                    <h1 className="text-lg font-bold tracking-tight font-outfit bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">

                        ResearchPilot AI

                    </h1>

                    <p className="text-[10px] uppercase tracking-widest text-zinc-500">

                        Multi-Agent Research Assistant

                    </p>

                </div>

            </div>

            {/* Right Controls */}

            <div className="flex items-center gap-4">

                {

                    envStatus?.mock_mode ?

                    (

                        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">

                            <ShieldCheck size={14}/>

                            Simulated Mode

                        </div>

                    )

                    :

                    (

                        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">

                            <Cpu size={14}/>

                            Gemini Connected

                        </div>

                    )

                }

                <button

                    onClick={onOpenSettings}

                    className="rounded-lg border border-zinc-700/40 bg-zinc-900/60 p-2 transition hover:bg-zinc-800 hover:text-white"

                    title="Settings"

                >

                    <Settings size={18}/>

                </button>

            </div>

        </header>

    );

}