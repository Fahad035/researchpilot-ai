import { useState, useEffect } from "react";

import {
  getHealth,
  getHistory,
  getResearch,
  createResearch,
  deleteResearch,
} from "../api/researchApi";

import useEventStream from "./useEventStream";

export default function useResearch() {
  /* -----------------------------
     Global State
  ------------------------------ */

  const [view, setView] = useState("landing");

  const [topic, setTopic] = useState("");

  const [history, setHistory] = useState([]);

  const [activeSession, setActiveSession] = useState(null);

  const [loading, setLoading] = useState(false);

  const [envStatus, setEnvStatus] = useState({
    mock_mode: true,
  });

  const [activeTab, setActiveTab] = useState("report");

  /* -----------------------------
     Event Stream Hook
  ------------------------------ */

  const {
    agentStates,
    activeAgentConsole,
    setActiveAgentConsole,
    resetPipeline,
    startStream,
  } = useEventStream();

  /* -----------------------------
     Initial Load
  ------------------------------ */

  useEffect(() => {
    refreshHistory();
    loadEnvironment();
  }, []);

  /* -----------------------------
     Environment
  ------------------------------ */

  async function loadEnvironment() {
    try {
      const data = await getHealth();

      setEnvStatus(data);
    } catch (err) {
      console.error(err);
    }
  }

  /* -----------------------------
     History
  ------------------------------ */

  async function refreshHistory() {
    try {
      const data = await getHistory();

      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  /* -----------------------------
     Open Previous Session
  ------------------------------ */

  async function selectSession(sessionId) {
    setLoading(true);

    try {
      const data = await getResearch(sessionId);

      setActiveSession(data);

      setView("workspace");

      if (data.report) setActiveTab("report");
      else if (data.comparison) setActiveTab("comparison");
      else if (data.summary) setActiveTab("summary");
      else if (data.papers) setActiveTab("papers");
      else setActiveTab("plan");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* -----------------------------
     Start New Research
  ------------------------------ */

  async function startResearch(searchTopic) {
    if (!searchTopic?.trim()) return;

    setLoading(true);

    resetPipeline();

    try {
      const session = await createResearch(searchTopic);

      setView("workspace");

      startStream({
        sessionId: session.session_id,

        onComplete: async () => {
          await selectSession(session.session_id);

          await refreshHistory();

          setLoading(false);
        },

        onError: (err) => {
          console.error(err);

          setLoading(false);
        },
      });

      return session;
    } catch (err) {
      console.error(err);

      setLoading(false);
    }
  }

  /* -----------------------------
     Delete Session
  ------------------------------ */

  async function deleteSession(sessionId) {
    try {
      await deleteResearch(sessionId);

      if (activeSession?.id === sessionId) {
        setActiveSession(null);

        setView("landing");
      }

      refreshHistory();
    } catch (err) {
      console.error(err);
    }
  }

  /* -----------------------------
     Export Markdown
  ------------------------------ */

  function exportMarkdown() {
    if (!activeSession?.report) return;

    const blob = new Blob([activeSession.report], {
      type: "text/markdown",
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = `${activeSession.topic
      .replace(/\s+/g, "_")
      .toLowerCase()}.md`;

    document.body.appendChild(a);

    a.click();

    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }

  /* -----------------------------
     Export PDF
  ------------------------------ */

  function exportPDF() {
    window.print();
  }

  return {
    view,
    setView,

    topic,
    setTopic,

    history,

    activeSession,

    loading,

    envStatus,

    activeTab,
    setActiveTab,

    activeAgentConsole,
    setActiveAgentConsole,

    agentStates,

    startResearch,

    selectSession,

    deleteSession,

    exportMarkdown,

    exportPDF,

    refreshHistory,
  };
}