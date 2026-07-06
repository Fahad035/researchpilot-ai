import {
    Compass,
    BookOpen,
    Code2,
    ClipboardList,
    FileText,
    Cpu
} from "lucide-react";

const features = [
    {
        icon: Compass,
        title: "Planner Agent",
        desc: "Creates an intelligent research roadmap before execution."
    },
    {
        icon: BookOpen,
        title: "Paper Search",
        desc: "Discovers relevant ArXiv papers using MCP tools."
    },
    {
        icon: ClipboardList,
        title: "Summarization",
        desc: "Generates concise literature summaries with Gemini."
    },
    {
        icon: Code2,
        title: "GitHub Discovery",
        desc: "Finds open-source implementations automatically."
    },
    {
        icon: Cpu,
        title: "Comparison Agent",
        desc: "Compares methodologies, datasets and model performance."
    },
    {
        icon: FileText,
        title: "Report Generation",
        desc: "Produces a complete technical research report with citations."
    }
];

export default function FeatureCards() {

    return (

        <div
            className="
            grid
            grid-cols-1
            md:grid-cols-2
            xl:grid-cols-3
            gap-6
            w-full
            max-w-6xl
        "
        >

            {features.map((item) => {

                const Icon = item.icon;

                return (

                    <div
                        key={item.title}
                        className="
                        rounded-2xl
                        border
                        border-zinc-800
                        bg-zinc-900/30
                        backdrop-blur-xl
                        p-6
                        hover:border-blue-500/40
                        transition-all
                        duration-300
                        group
                    "
                    >

                        <div
                            className="
                            h-12
                            w-12
                            rounded-xl
                            bg-blue-600/15
                            flex
                            items-center
                            justify-center
                            mb-5
                            group-hover:scale-110
                            transition
                        "
                        >

                            <Icon
                                size={24}
                                className="text-blue-400"
                            />

                        </div>

                        <h3 className="text-lg font-bold text-white mb-3">
                            {item.title}
                        </h3>

                        <p className="text-sm text-zinc-400 leading-relaxed">
                            {item.desc}
                        </p>

                    </div>

                );

            })}

        </div>

    );

}