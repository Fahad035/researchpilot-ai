const API_BASE = "http://localhost:8000";

export async function getHealth() {
    const res = await fetch(`${API_BASE}/api/health`);

    if (!res.ok)
        throw new Error("Health check failed");

    return await res.json();
}

export async function getHistory() {

    const res = await fetch(
        `${API_BASE}/api/research/history`
    );

    if (!res.ok)
        throw new Error("Cannot load history");

    return await res.json();
}

export async function createResearch(topic) {

    const res = await fetch(
        `${API_BASE}/api/research`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                topic
            })
        }
    );

    if (!res.ok) {

        const err = await res.json();

        throw new Error(
            err.detail || "Research creation failed"
        );
    }

    return await res.json();
}

export async function getResearch(sessionId) {

    const res = await fetch(
        `${API_BASE}/api/research/${sessionId}`
    );

    if (!res.ok)
        throw new Error("Cannot load session");

    return await res.json();
}

export async function deleteResearch(sessionId) {

    const res = await fetch(
        `${API_BASE}/api/research/${sessionId}`,
        {
            method: "DELETE"
        }
    );

    if (!res.ok)
        throw new Error("Delete failed");

    return true;
}

/*
---------------------------------------------------
Server Sent Events
---------------------------------------------------
*/

export function createResearchStream(sessionId) {

    return new EventSource(
        `${API_BASE}/api/research/${sessionId}/stream`
    );

}