import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  BookOpen, 
  Code2, 
  ClipboardList, 
  FileText, 
  Compass, 
  Settings, 
  Plus, 
  Download, 
  Trash2, 
  Play, 
  CheckCircle, 
  Loader2, 
  History, 
  ExternalLink,
  ShieldCheck,
  Cpu,
  RefreshCw,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' | 'workspace'
  const [topic, setTopic] = useState('');
  const [history, setHistory] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('report');
  
  // Real-time agent states
  const [agentStates, setAgentStates] = useState({
    planner: { status: 'waiting', log: '' },
    paper_search: { status: 'waiting', log: '' },
    summary: { status: 'waiting', log: '' },
    github: { status: 'waiting', log: '' },
    comparison: { status: 'waiting', log: '' },
    citation: { status: 'waiting', log: '' },
    report: { status: 'waiting', log: '' }
  });

  const [activeAgentConsole, setActiveAgentConsole] = useState('planner');
  const [envStatus, setEnvStatus] = useState({ mock_mode: true });
  const [showSettings, setShowSettings] = useState(false);
  
  const consoleEndRef = useRef(null);

  // Fetch history and environment status on load
  useEffect(() => {
    fetchHistory();
    fetchEnvStatus();
  }, []);

  // Auto-scroll agent console when logs update
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [agentStates]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/research/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchEnvStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setEnvStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    }
  };

  const selectSession = async (sessionId) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/research/${sessionId}`);
      if (res.ok) {
        const data = await res.json();
        setActiveSession(data);
        setView('workspace');
        
        // Map saved logs/data to agentStates
        const newStates = { ...agentStates };
        Object.keys(newStates).forEach(key => {
          if (data.agent_logs && data.agent_logs[key]) {
            newStates[key] = {
              status: data.agent_logs[key].status,
              log: data.agent_logs[key].log_text || ''
            };
          } else {
            newStates[key] = { status: data.status === 'completed' ? 'completed' : 'waiting', log: '' };
          }
        });
        setAgentStates(newStates);
        
        // Set first non-empty tab
        if (data.report) setActiveTab('report');
        else if (data.comparison) setActiveTab('comparison');
        else if (data.summary) setActiveTab('summary');
        else setActiveTab('plan');
      }
    } catch (err) {
      console.error('Failed to fetch session details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartResearch = async (searchTopic) => {
    if (!searchTopic.trim()) return;
    setLoading(true);
    setView('workspace');
    setActiveSession(null);
    
    // Reset agent states
    const resetStates = {};
    Object.keys(agentStates).forEach(key => {
      resetStates[key] = { status: 'waiting', log: '' };
    });
    setAgentStates(resetStates);
    setActiveAgentConsole('planner');
    
    try {
      const res = await fetch(`${API_BASE}/api/research`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchTopic })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        alert(errData.detail || 'Research creation failed.');
        setLoading(false);
        return;
      }
      
      const sessionData = await res.json();
      startStream(sessionData.session_id, searchTopic);
    } catch (err) {
      console.error('Failed to start research:', err);
      alert('Could not connect to backend server. Make sure FastAPI backend is running on port 8000.');
      setLoading(false);
    }
  };

  const startStream = (sessionId, searchTopic) => {
    const eventSource = new EventSource(`${API_BASE}/api/research/${sessionId}/stream`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      setAgentStates(prev => {
        const next = { ...prev };
        next[data.agent] = {
          status: data.status,
          log: data.data || data.message
        };
        return next;
      });

      if (data.status === 'running') {
        setActiveAgentConsole(data.agent);
      }

      if (data.agent === 'report' && data.status === 'completed') {
        eventSource.close();
        setLoading(false);
        selectSession(sessionId);
        fetchHistory();
      }
      
      if (data.status === 'failed') {
        eventSource.close();
        setLoading(false);
        alert(`Research pipeline encountered an error on ${data.agent} agent: ${data.message}`);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
      eventSource.close();
      setLoading(false);
    };
  };

  const handleDeleteSession = async (sessionId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this research session?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/research/${sessionId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        if (activeSession && activeSession.id === sessionId) {
          setActiveSession(null);
        }
        fetchHistory();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const exportMarkdown = () => {
    if (!activeSession || !activeSession.report) return;
    const blob = new Blob([activeSession.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSession.topic.toLowerCase().replace(/\s+/g, '_')}_report.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const exportPDF = () => {
    window.print();
  };

  // Agent Status helper classes
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="flex items-center text-xs text-emerald-400 gap-1 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">✓ Completed</span>;
      case 'running':
        return <span className="flex items-center text-xs text-blue-400 gap-1 font-medium bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20"><Loader2 size={12} className="animate-spin" /> Running</span>;
      case 'processing':
        return <span className="flex items-center text-xs text-amber-400 gap-1 font-medium bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20"><Loader2 size={12} className="animate-spin" /> Processing</span>;
      case 'failed':
        return <span className="flex items-center text-xs text-red-400 gap-1 font-medium bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">✕ Failed</span>;
      default:
        return <span className="flex items-center text-xs text-zinc-500 gap-1 font-medium bg-zinc-800/40 px-2.5 py-0.5 rounded-full border border-zinc-700/20">Waiting</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans selection:bg-blue-500/30 flex flex-col relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-[-30%] left-[-20%] w-[70%] h-[60%] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[50%] rounded-full bg-purple-900/10 blur-[150px] pointer-events-none" />

      {/* Header / Nav */}
      <header className="w-full py-4 px-6 border-b border-zinc-800/40 flex items-center justify-between glass-panel sticky top-0 z-50 screen-only">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setView('landing')}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 font-outfit">
            RP
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight font-outfit flex items-center gap-1.5 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              ResearchPilot AI
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium tracking-wide uppercase">Multi-Agent Assistant</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {envStatus.mock_mode && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 text-[11px] text-amber-400 font-medium">
              <ShieldCheck size={13} />
              Simulated Mode
            </div>
          )}
          {!envStatus.mock_mode && (
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1 text-[11px] text-emerald-400 font-medium">
              <Cpu size={13} />
              Gemini Connected
            </div>
          )}
          <button 
            onClick={() => setShowSettings(!showSettings)} 
            className="p-2 text-zinc-400 hover:text-white bg-zinc-800/40 border border-zinc-700/30 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-[#0d0d12] border border-zinc-800/80 rounded-2xl p-6 glass-panel-heavy shadow-2xl relative"
            >
              <h3 className="text-lg font-bold font-outfit mb-4">Workspace Configurations</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Active LLM Model</label>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 font-mono">
                    gemini-2.5-flash
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">MCP Tools Configured</label>
                  <ul className="text-xs text-zinc-300 space-y-1.5 font-mono bg-zinc-900 p-3 rounded-lg border border-zinc-800">
                    <li className="flex items-center gap-2 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      search_papers() (ArXiv MCP)
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      search_github() (GitHub MCP)
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      save_notes() (Filesystem MCP)
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      read_pdf() (Filesystem MCP)
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 block mb-1">Environment Status</label>
                  <p className="text-xs text-zinc-400">
                    {envStatus.mock_mode 
                      ? "Running in sandbox mode. Results are simulated using realistic datasets." 
                      : "Direct Gemini connection active. Performing live online academic querying."
                    }
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowSettings(false)}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-medium text-sm transition-colors"
              >
                Close Settings
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden">
        {/* LANDING VIEW */}
        {view === 'landing' && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-4xl mx-auto space-y-10 my-12 screen-only">
            {/* Hero Badge */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold rounded-full uppercase tracking-wider glow-accent"
            >
              <Award size={13} />
              Kaggle Capstone Freestyle Entry
            </motion.div>

            {/* Main Title */}
            <div className="space-y-4">
              <motion.h2 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl sm:text-6xl font-extrabold font-outfit tracking-tight bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent leading-[1.1]"
              >
                ResearchPilot AI
              </motion.h2>
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg sm:text-xl text-zinc-400 font-light max-w-2xl mx-auto"
              >
                Multi-Agent Research Assistant powered by Google Gemini + ADK + MCP
              </motion.p>
            </div>

            {/* Input Search Box */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="w-full max-w-2xl bg-zinc-900/60 border border-zinc-800/80 p-2 rounded-2xl shadow-xl flex items-center gap-2 focus-within:border-blue-500/50 transition-all glow-accent"
            >
              <Search className="text-zinc-500 ml-3 shrink-0" size={20} />
              <input 
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a research topic (e.g. Federated Learning in Healthcare)..."
                className="flex-1 bg-transparent border-none outline-none text-zinc-200 text-md py-3 px-1 placeholder:text-zinc-500"
                onKeyDown={(e) => e.key === 'Enter' && handleStartResearch(topic)}
              />
              <button 
                onClick={() => handleStartResearch(topic)}
                disabled={!topic.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium text-sm flex items-center gap-1.5 transition-all disabled:opacity-40"
              >
                Start Research
                <Play size={14} fill="white" />
              </button>
            </motion.div>

            {/* Multi-Agent Architecture Preview */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full border border-zinc-800/60 rounded-2xl bg-zinc-900/25 p-6 glass-panel"
            >
              <h4 className="text-xs text-zinc-500 font-semibold tracking-wider uppercase mb-4">Autonomous Execution Pipeline</h4>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
                {[
                  { name: "Planner", icon: Compass, color: "text-blue-400 bg-blue-500/10" },
                  { name: "Search", icon: Search, color: "text-purple-400 bg-purple-500/10" },
                  { name: "Summarizer", icon: BookOpen, color: "text-pink-400 bg-pink-500/10" },
                  { name: "GitHub", icon: Code2, color: "text-zinc-400 bg-zinc-500/10" },
                  { name: "Comparison", icon: ClipboardList, color: "text-amber-400 bg-amber-500/10" },
                  { name: "Citation", icon: FileText, color: "text-emerald-400 bg-emerald-500/10" },
                  { name: "Report", icon: Award, color: "text-red-400 bg-red-500/10" }
                ].map((agent, i) => (
                  <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-zinc-900/40 border border-zinc-800/60">
                    <div className={`p-2 rounded-lg ${agent.color} mb-2`}>
                      <agent.icon size={16} />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium truncate w-full">{agent.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions (History links) */}
            {history.length > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-left w-full max-w-2xl"
              >
                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-semibold mb-3">
                  <History size={14} />
                  Recent Research Runs
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {history.slice(0, 4).map((h) => (
                    <button
                      key={h.id}
                      onClick={() => selectSession(h.id)}
                      className="p-3 text-left bg-zinc-900/30 hover:bg-zinc-800/40 border border-zinc-800/60 rounded-xl flex items-center justify-between text-xs text-zinc-300 transition-colors"
                    >
                      <span className="truncate pr-4">{h.topic}</span>
                      <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* WORKSPACE VIEW */}
        {view === 'workspace' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-800/40 bg-zinc-900/10 flex flex-col screen-only shrink-0">
              {/* New Run Button */}
              <div className="p-4 border-b border-zinc-800/30">
                <button 
                  onClick={() => {
                    setView('landing');
                    setActiveSession(null);
                  }}
                  className="w-full py-2.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/20 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  New Research Run
                </button>
              </div>

              {/* History List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider px-2 mb-2">History</div>
                
                {history.length === 0 ? (
                  <p className="text-[11px] text-zinc-600 px-2 py-4 italic">No research runs yet.</p>
                ) : (
                  history.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => selectSession(h.id)}
                      className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between group transition-colors text-xs ${
                        activeSession && activeSession.id === h.id 
                          ? 'bg-zinc-800/60 text-white font-medium border border-zinc-700/30' 
                          : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'
                      }`}
                    >
                      <span className="truncate pr-2">{h.topic}</span>
                      <Trash2 
                        size={12} 
                        onClick={(e) => handleDeleteSession(h.id, e)} 
                        className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                    </button>
                  ))
                )}
              </div>

              {/* Sidebar footer status */}
              <div className="p-3 border-t border-zinc-800/30 bg-zinc-900/20 text-[10px] text-zinc-500 space-y-1">
                <div>Model: <span className="text-zinc-400 font-mono">gemini-2.5-flash</span></div>
                <div>Server status: <span className="text-emerald-400">🟢 Active</span></div>
              </div>
            </aside>

            {/* Workspace Main Panel */}
            <div className="flex-1 flex flex-col bg-[#070709] overflow-hidden">
              {/* Top Banner (Header) */}
              <div className="border-b border-zinc-800/40 p-4 px-6 flex items-center justify-between glass-panel shrink-0 screen-only">
                <div className="space-y-0.5">
                  <h3 className="text-md font-bold tracking-tight font-outfit">
                    {activeSession ? activeSession.topic : topic}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Active Session</span>
                  </div>
                </div>

                {activeSession && (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={exportMarkdown}
                      className="px-3 py-1.5 text-zinc-300 hover:text-white bg-zinc-800/40 border border-zinc-700/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Download Markdown"
                    >
                      <Download size={13} />
                      Markdown
                    </button>
                    <button 
                      onClick={exportPDF}
                      className="px-3 py-1.5 text-zinc-300 hover:text-white bg-zinc-800/40 border border-zinc-700/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      title="Export PDF Report"
                    >
                      <FileText size={13} />
                      Export PDF
                    </button>
                  </div>
                )}
              </div>

              {/* Main Content Area split into Execution Details & Tabs Results */}
              <div className="flex-1 flex overflow-hidden">
                {/* LEFT: Execution timeline and Agent status log console */}
                <div className="w-80 border-r border-zinc-800/40 bg-zinc-900/5 flex flex-col overflow-hidden shrink-0 screen-only">
                  {/* Timeline statuses */}
                  <div className="p-4 border-b border-zinc-800/30 space-y-3.5">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Agents Status</div>
                    
                    <div className="space-y-2">
                      {[
                        { key: "planner", label: "Planner Agent" },
                        { key: "paper_search", label: "Paper Search Agent" },
                        { key: "summary", label: "Paper Summarizer" },
                        { key: "github", label: "GitHub Discoverer" },
                        { key: "comparison", label: "Comparison Agent" },
                        { key: "citation", label: "Citation Agent" },
                        { key: "report", label: "Final Report Agent" }
                      ].map((node) => (
                        <button
                          key={node.key}
                          onClick={() => setActiveAgentConsole(node.key)}
                          className={`w-full text-left p-2 rounded-lg flex items-center justify-between transition-colors border ${
                            activeAgentConsole === node.key 
                              ? 'bg-zinc-800/40 border-zinc-700/30 text-white' 
                              : 'border-transparent text-zinc-400 hover:bg-zinc-900/30'
                          }`}
                        >
                          <span className="text-xs font-medium">{node.label}</span>
                          {getStatusBadge(agentStates[node.key].status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Log Console Terminal */}
                  <div className="flex-1 flex flex-col bg-[#050508] border-t border-zinc-800/20 overflow-hidden">
                    <div className="px-4 py-2 bg-zinc-950/60 border-b border-zinc-800/30 flex items-center justify-between shrink-0">
                      <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-semibold flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        Live Console logs: {activeAgentConsole}
                      </span>
                    </div>

                    <div className="flex-1 p-4 font-mono text-[10px] leading-relaxed text-zinc-400 overflow-y-auto whitespace-pre-wrap select-text">
                      {agentStates[activeAgentConsole].log ? (
                        <div>
                          {agentStates[activeAgentConsole].log}
                          <div ref={consoleEndRef} />
                        </div>
                      ) : (
                        <div className="text-zinc-600 italic">Console logs will stream here during execution.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT: Results Viewer tabs */}
                <div className="flex-1 flex flex-col bg-zinc-950/15 overflow-hidden print-full">
                  {/* Tabs header list */}
                  <div className="bg-zinc-900/10 border-b border-zinc-800/40 p-2 shrink-0 flex items-center gap-1 screen-only">
                    {[
                      { key: "plan", label: "Planner", enabled: !!(activeSession?.plan || agentStates.planner.log) },
                      { key: "papers", label: "Papers", enabled: !!(activeSession?.papers || agentStates.paper_search.log) },
                      { key: "summary", label: "Summaries", enabled: !!(activeSession?.summary || agentStates.summary.log) },
                      { key: "github", label: "GitHub", enabled: !!(activeSession?.github || agentStates.github.log) },
                      { key: "comparison", label: "Comparison", enabled: !!(activeSession?.comparison || agentStates.comparison.log) },
                      { key: "report", label: "Final Report", enabled: !!(activeSession?.report || agentStates.report.log) }
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => tab.enabled && setActiveTab(tab.key)}
                        disabled={!tab.enabled}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          activeTab === tab.key 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : tab.enabled 
                              ? 'text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200' 
                              : 'text-zinc-700 cursor-not-allowed'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tabs Content Display */}
                  <div className="flex-1 p-6 sm:p-8 overflow-y-auto print-full bg-[#070709]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="prose prose-invert max-w-4xl mx-auto text-sm leading-relaxed text-zinc-300 print-full"
                      >
                        {activeTab === 'plan' && (
                          <div className="markdown-render">
                            <h3 className="text-xl font-bold font-outfit text-white mb-4 border-b border-zinc-800 pb-2">Planner Execution Strategy</h3>
                            <div className="whitespace-pre-wrap">{activeSession?.plan || agentStates.planner.log}</div>
                          </div>
                        )}

                        {activeTab === 'papers' && (
                          <div className="markdown-render">
                            <h3 className="text-xl font-bold font-outfit text-white mb-4 border-b border-zinc-800 pb-2">Academic Paper Index</h3>
                            <div className="whitespace-pre-wrap">{activeSession?.papers || agentStates.paper_search.log}</div>
                          </div>
                        )}

                        {activeTab === 'summary' && (
                          <div className="markdown-render">
                            <h3 className="text-xl font-bold font-outfit text-white mb-4 border-b border-zinc-800 pb-2">Structured Paper Summaries</h3>
                            <div className="whitespace-pre-wrap">{activeSession?.summary || agentStates.summary.log}</div>
                          </div>
                        )}

                        {activeTab === 'github' && (
                          <div className="markdown-render">
                            <h3 className="text-xl font-bold font-outfit text-white mb-4 border-b border-zinc-800 pb-2">GitHub Code Repositories</h3>
                            <div className="whitespace-pre-wrap">{activeSession?.github || agentStates.github.log}</div>
                          </div>
                        )}

                        {activeTab === 'comparison' && (
                          <div className="markdown-render">
                            <h3 className="text-xl font-bold font-outfit text-white mb-4 border-b border-zinc-800 pb-2">Research Comparison Matrix</h3>
                            <div className="overflow-x-auto whitespace-pre-wrap">{activeSession?.comparison || agentStates.comparison.log}</div>
                          </div>
                        )}

                        {activeTab === 'report' && (
                          <div className="markdown-render print-full">
                            <h3 className="text-xl font-bold font-outfit text-white mb-4 border-b border-zinc-800 pb-2 screen-only">Consolidated Technical Report</h3>
                            
                            {/* Renders citation references block when displaying report */}
                            <div className="whitespace-pre-wrap">
                              {activeSession?.report || agentStates.report.log}
                            </div>
                            
                            {(activeSession?.citations || agentStates.citation.log) && (
                              <div className="mt-8 pt-6 border-t border-zinc-800">
                                <h4 className="text-lg font-bold font-outfit text-white mb-3">Bibliography & References</h4>
                                <div className="whitespace-pre-wrap bg-zinc-950/40 p-4 rounded-xl border border-zinc-800/60 font-sans text-xs">
                                  {activeSession?.citations || agentStates.citation.log}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-3 px-6 text-center text-[10px] text-zinc-600 border-t border-zinc-900 screen-only shrink-0">
        ResearchPilot AI © 2026. Made with Google Gemini + ADK + MCP client wrapper.
      </footer>
    </div>
  );
}
