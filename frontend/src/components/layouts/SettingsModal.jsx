import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsModal({

    open,

    onClose,

    envStatus

}) {

    return (

        <AnimatePresence>

            {

                open && (

                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

                        <motion.div

                            initial={{ opacity: 0, scale: 0.95 }}

                            animate={{ opacity: 1, scale: 1 }}

                            exit={{ opacity: 0, scale: 0.95 }}

                            transition={{ duration: 0.2 }}

                            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0d0d12] p-6 shadow-2xl"

                        >

                            <h2 className="text-xl font-bold font-outfit text-white mb-6">

                                Workspace Settings

                            </h2>

                            {/* Gemini */}

                            <div className="mb-5">

                                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">

                                    Active LLM

                                </p>

                                <div className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-300">

                                    gemini-2.5-flash

                                </div>

                            </div>

                            {/* MCP */}

                            <div className="mb-5">

                                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">

                                    MCP Tools

                                </p>

                                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">

                                    <ul className="space-y-2 text-xs text-zinc-300">

                                        <li className="flex items-center gap-2">

                                            <span className="h-2 w-2 rounded-full bg-emerald-400"/>

                                            search_papers()

                                        </li>

                                        <li className="flex items-center gap-2">

                                            <span className="h-2 w-2 rounded-full bg-emerald-400"/>

                                            search_github()

                                        </li>

                                        <li className="flex items-center gap-2">

                                            <span className="h-2 w-2 rounded-full bg-emerald-400"/>

                                            save_notes()

                                        </li>

                                        <li className="flex items-center gap-2">

                                            <span className="h-2 w-2 rounded-full bg-emerald-400"/>

                                            read_pdf()

                                        </li>

                                    </ul>

                                </div>

                            </div>

                            {/* Environment */}

                            <div className="mb-6">

                                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">

                                    Environment

                                </p>

                                <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">

                                    {

                                        envStatus?.mock_mode ? (

                                            <div>

                                                <p className="text-amber-400 font-semibold">

                                                    Sandbox Mode

                                                </p>

                                                <p className="text-xs text-zinc-400 mt-1">

                                                    Gemini API key not detected.

                                                    The application is using

                                                    simulated outputs.

                                                </p>

                                            </div>

                                        ) : (

                                            <div>

                                                <p className="text-emerald-400 font-semibold">

                                                    Live Gemini Connected

                                                </p>

                                                <p className="text-xs text-zinc-400 mt-1">

                                                    Google Gemini API is active.

                                                    All agents perform real

                                                    inference using Gemini

                                                    and MCP tools.

                                                </p>

                                            </div>

                                        )

                                    }

                                </div>

                            </div>

                            {/* Future */}

                            <div className="mb-6">

                                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-2">

                                    Upcoming Features

                                </p>

                                <ul className="space-y-2 text-xs text-zinc-400">

                                    <li>• Model selection</li>

                                    <li>• Temperature control</li>

                                    <li>• Research depth</li>

                                    <li>• Max paper count</li>

                                    <li>• Export preferences</li>

                                    <li>• Citation format</li>

                                </ul>

                            </div>

                            <button

                                onClick={onClose}

                                className="w-full rounded-lg bg-zinc-800 py-2 text-sm font-semibold transition hover:bg-zinc-700"

                            >

                                Close

                            </button>

                        </motion.div>

                    </div>

                )

            }

        </AnimatePresence>

    );

}