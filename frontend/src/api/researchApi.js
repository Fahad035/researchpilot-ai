const API = "http://localhost:8000";

export async function createResearch(topic) {

    const res = await fetch(`${API}/api/research`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            topic
        })

    });

    return await res.json();
}

export function streamResearch(sessionId, onMessage) {

    const eventSource = new EventSource(
        `${API}/api/research/${sessionId}/stream`
    );

    eventSource.onmessage = (event) => {

        const data = JSON.parse(event.data);

        onMessage(data);

        if (data.type === "complete") {

            eventSource.close();

        }
    };

    eventSource.onerror = () => {

        eventSource.close();

    };

    return eventSource;
}