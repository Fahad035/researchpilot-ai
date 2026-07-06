import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownRenderer({ content = "" }) {

    if (!content || content.trim() === "") {

        return (

            <div className="flex items-center justify-center py-20">

                <div className="text-center">

                    <p className="text-zinc-500 text-lg">
                        Nothing to display yet.
                    </p>

                    <p className="text-zinc-600 text-sm mt-2">
                        Results from the selected agent will appear here.
                    </p>

                </div>

            </div>

        );

    }

    return (

        <div
            className="
            prose
            prose-invert
            max-w-none

            prose-headings:text-white
            prose-headings:font-bold

            prose-p:text-zinc-300
            prose-p:leading-8

            prose-strong:text-white

            prose-a:text-blue-400
            prose-a:no-underline
            hover:prose-a:underline

            prose-code:text-pink-400

            prose-li:text-zinc-300

            prose-blockquote:border-blue-500
            prose-blockquote:text-zinc-300

            prose-table:w-full
            prose-table:border-collapse

            prose-th:border
            prose-th:border-zinc-700
            prose-th:bg-zinc-900
            prose-th:p-3

            prose-td:border
            prose-td:border-zinc-800
            prose-td:p-3
        "
        >

            <ReactMarkdown

                remarkPlugins={[remarkGfm]}

                components={{

                    code({

                        inline,

                        className,

                        children,

                        ...props

                    }) {

                        const match = /language-(\w+)/.exec(
                            className || ""
                        );

                        if (!inline && match) {

                            return (

                                <SyntaxHighlighter

                                    style={oneDark}

                                    language={match[1]}

                                    PreTag="div"

                                    customStyle={{

                                        borderRadius: "12px",

                                        fontSize: "14px",

                                        padding: "18px",

                                    }}

                                    {...props}

                                >

                                    {String(children).replace(/\n$/, "")}

                                </SyntaxHighlighter>

                            );

                        }

                        return (

                            <code

                                className="bg-zinc-800 rounded px-1 py-0.5"

                                {...props}

                            >

                                {children}

                            </code>

                        );

                    },

                    table({ children }) {

                        return (

                            <div className="overflow-x-auto my-6">

                                <table>

                                    {children}

                                </table>

                            </div>

                        );

                    },

                    h1({ children }) {

                        return (

                            <h1 className="text-4xl mb-6 mt-8">

                                {children}

                            </h1>

                        );

                    },

                    h2({ children }) {

                        return (

                            <h2 className="text-3xl mt-8 mb-4">

                                {children}

                            </h2>

                        );

                    },

                    h3({ children }) {

                        return (

                            <h3 className="text-2xl mt-6 mb-3">

                                {children}

                            </h3>

                        );

                    },

                    blockquote({ children }) {

                        return (

                            <blockquote
                                className="
                                border-l-4
                                border-blue-500
                                pl-4
                                italic
                                my-6
                            "
                            >

                                {children}

                            </blockquote>

                        );

                    }

                }}

            >

                {content}

            </ReactMarkdown>

        </div>

    );

}