import React from "react";
import { motion } from "framer-motion";

import Hero from "./Hero";
import SearchBox from "./SearchBox";
import FeatureCards from "./FeatureCards";

export default function LandingPage({

    topic,
    setTopic,

    history,

    loading,

    onStartResearch,

    onSelectSession

}) {
    return (

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-16">

            {/* Hero */}

            <Hero />

            {/* Search */}

            <motion.div

                initial={{ opacity: 0, y: 15 }}

                animate={{ opacity: 1, y: 0 }}

                transition={{ delay: 0.35 }}

                className="w-full max-w-3xl mt-12"

            >

                <SearchBox

                    topic={topic}

                    setTopic={setTopic}

                    loading={loading}

                    onStartResearch={onStartResearch}

                />

            </motion.div>

            {/* Features */}

            <motion.div

                initial={{ opacity: 0 }}

                animate={{ opacity: 1 }}

                transition={{ delay: 0.45 }}

                className="w-full max-w-6xl mt-16"

            >

                <FeatureCards />

            </motion.div>

            {/* Recent Research */}

            {

                history.length > 0 && (

                    <motion.div

                        initial={{ opacity: 0 }}

                        animate={{ opacity: 1 }}

                        transition={{ delay: 0.55 }}

                        className="w-full max-w-4xl mt-16"

                    >

                        <div className="flex items-center justify-between mb-5">

                            <h2 className="text-xl font-bold font-outfit">

                                Recent Research

                            </h2>

                            <span className="text-xs text-zinc-500">

                                {history.length} Sessions

                            </span>

                        </div>

                        <div className="space-y-3">

                            {

                                history

                                    .slice()

                                    .reverse()

                                    .slice(0, 5)

                                    .map((item) => (

                                        <button

                                            key={item.id}

                                            onClick={() => onSelectSession(item.id)}

                                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-left transition hover:border-blue-500/30 hover:bg-zinc-900"

                                        >

                                            <div className="flex items-center justify-between">

                                                <div>

                                                    <h3 className="font-semibold text-white">

                                                        {item.topic}

                                                    </h3>

                                                    <p className="mt-1 text-xs text-zinc-500">

                                                        {item.status}

                                                    </p>

                                                </div>

                                                <span className="text-xs text-blue-400">

                                                    Open →

                                                </span>

                                            </div>

                                        </button>

                                    ))

                            }

                        </div>

                    </motion.div>

                )

            }

        </div>

    );

}