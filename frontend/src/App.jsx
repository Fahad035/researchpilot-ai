import { useState } from "react";

import Header from "./components/layouts/Header";
import Footer from "./components/layouts/Footer";
import SettingsModal from "./components/layouts/SettingsModal";

import LandingPage from "./components/landing/LandingPage";
import Workspace from "./components/workspace/Workspace";

import useResearch from "./hooks/useResearch";

export default function App() {

  const {

    view,
    setView,

    topic,
    setTopic,

    history,

    activeSession,

    loading,

    activeTab,
    setActiveTab,

    activeAgentConsole,
    setActiveAgentConsole,

    agentStates,

    envStatus,

    startResearch,

    selectSession,

    deleteSession,

    exportMarkdown,

    exportPDF,

    refreshHistory

  } = useResearch();

  const [showSettings, setShowSettings] = useState(false);
  

  return (

    <div className="min-h-screen bg-[#070709] text-white flex flex-col overflow-hidden">

      {/* Background */}

      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-blue-900/10 blur-[150px]" />

      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] rounded-full bg-purple-900/10 blur-[150px]" />

      {/* Header */}

      <Header

        envStatus={envStatus}

        onLogoClick={() => setView("landing")}

        onSettings={() => setShowSettings(true)}

      />

      {/* Settings */}

      <SettingsModal

        open={showSettings}

        onClose={() => setShowSettings(false)}

        envStatus={envStatus}

      />

      {/* Main */}

      <main className="flex-1 overflow-hidden">

        {view === "landing" ? (

          <LandingPage

            topic={topic}

            setTopic={setTopic}

            history={history}

            loading={loading}

            onStartResearch={startResearch}

            onSelectSession={selectSession}

            onDeleteSession={deleteSession}

          />

        ) : (

          <Workspace

            loading={loading}

            history={history}

            activeSession={activeSession}

            activeTab={activeTab}

            setActiveTab={setActiveTab}

            activeAgentConsole={activeAgentConsole}

            setActiveAgentConsole={setActiveAgentConsole}

            agentStates={agentStates}

            onExportMarkdown={exportMarkdown}

            onExportPDF={exportPDF}

            onRefreshHistory={refreshHistory}

            onBack={() => setView("landing")}

          />

        )}

      </main>

      {/* Footer */}

      <Footer />

    </div>

  );

}