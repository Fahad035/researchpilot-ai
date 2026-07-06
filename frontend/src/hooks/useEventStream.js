import { useState } from "react";

import { createResearchStream } from "../api/researchApi";

export default function useEventStream() {

    /*
    ----------------------------------------
    Active Agent Console
    ----------------------------------------
    */

    const [activeAgentConsole, setActiveAgentConsole] =
        useState("planner");

    /*
    ----------------------------------------
    Agent States
    ----------------------------------------
    */

    const initialState = {

        planner: {
            status: "waiting",
            log: ""
        },

        paper_search: {
            status: "waiting",
            log: ""
        },

        summary: {
            status: "waiting",
            log: ""
        },

        github: {
            status: "waiting",
            log: ""
        },

        comparison: {
            status: "waiting",
            log: ""
        },

        citation: {
            status: "waiting",
            log: ""
        },

        report: {
            status: "waiting",
            log: ""
        }

    };

    const [agentStates, setAgentStates] =
        useState(initialState);

    /*
    ----------------------------------------
    Reset Pipeline
    ----------------------------------------
    */

    function resetPipeline() {

        setAgentStates(initialState);

        setActiveAgentConsole("planner");

    }

    /*
    ----------------------------------------
    Update Agent
    ----------------------------------------
    */

    function updateAgent(agent, status, log) {

        setAgentStates((prev) => ({

            ...prev,

            [agent]: {

                status,

                log

            }

        }));

    }

    /*
    ----------------------------------------
    Start SSE Stream
    ----------------------------------------
    */

    function startStream({

        sessionId,

        onComplete,

        onError

    }) {

        const stream = createResearchStream(
            sessionId
        );

        stream.onmessage = (event) => {

            const data = JSON.parse(
                event.data
            );

            /*
            -----------------------------
            STATUS EVENT
            -----------------------------
            */

            if (data.type === "status") {

                updateAgent(

                    normalize(data.agent),

                    data.status,

                    agentStates[
                        normalize(data.agent)
                    ]?.log || ""

                );

                if (data.status === "running") {

                    setActiveAgentConsole(
                        normalize(data.agent)
                    );

                }

            }

            /*
            -----------------------------
            LOG EVENT
            -----------------------------
            */

            if (data.type === "log") {

                updateAgent(

                    normalize(data.agent),

                    "running",

                    data.text

                );

            }

            /*
            -----------------------------
            DONE EVENT
            -----------------------------
            */

            if (

                normalize(data.agent) === "report" &&

                data.status === "completed"

            ) {

                stream.close();

                if (onComplete)

                    onComplete();

            }

            /*
            -----------------------------
            ERROR EVENT
            -----------------------------
            */

            if (data.status === "failed") {

                stream.close();

                if (onError)

                    onError(data);

            }

        };

        stream.onerror = () => {

            stream.close();

            if (onError)

                onError({

                    message:

                        "Lost connection to backend."

                });

        };

        return stream;

    }

    /*
    ----------------------------------------
    Backend Agent Names
    ->
    Frontend Keys
    ----------------------------------------
    */

    function normalize(agent) {

        switch (agent.toLowerCase()) {

            case "planner":

                return "planner";

            case "paper search":

                return "paper_search";

            case "summary":

                return "summary";

            case "github":

                return "github";

            case "comparison":

                return "comparison";

            case "citation":

                return "citation";

            case "report":

                return "report";

            default:

                return agent
                    .toLowerCase()
                    .replaceAll(" ", "_");

        }

    }

    return {

        agentStates,

        activeAgentConsole,

        setActiveAgentConsole,

        resetPipeline,

        startStream

    };

}