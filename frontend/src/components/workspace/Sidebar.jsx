import { useMemo, useState } from "react";

import {
  Search,
  History,
  Trash2,
  Calendar,
  FileSearch,
  Plus,
} from "lucide-react";

export default function Sidebar({
  history = [],
  activeSession,
  onSelectSession,
  onDeleteSession,
}) {
  const [search, setSearch] = useState("");

  const filteredHistory = useMemo(() => {
    if (!search.trim()) return history;

    return history.filter((item) =>
      item.topic.toLowerCase().includes(search.toLowerCase())
    );
  }, [history, search]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    try {
      return new Date(timestamp * 1000).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <aside
      className="
      w-[320px]
      border-r
      border-zinc-800
      bg-zinc-950/60
      backdrop-blur-xl
      flex
      flex-col
      overflow-hidden
    "
    >
      {/* Header */}

      <div className="p-5 border-b border-zinc-800">

        <button
          onClick={() => window.location.reload()}
          className="
          w-full
          flex
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-blue-600
          hover:bg-blue-500
          py-3
          font-semibold
          transition
        "
        >
          <Plus size={18} />
          New Research
        </button>

      </div>

      {/* Search */}

      <div className="p-4">

        <div
          className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-zinc-800
          bg-zinc-900
          px-3
          py-2
        "
        >
          <Search
            size={18}
            className="text-zinc-500"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search history..."
            className="
            bg-transparent
            outline-none
            flex-1
            text-sm
            placeholder:text-zinc-500
          "
          />
        </div>

      </div>

      {/* History Header */}

      <div className="px-5 pb-3 flex items-center gap-2">

        <History
          size={18}
          className="text-blue-400"
        />

        <span className="font-semibold text-sm">
          Research History
        </span>

      </div>

      {/* History List */}

      <div
        className="
        flex-1
        overflow-y-auto
        px-3
        pb-4
      "
      >
        {filteredHistory.length === 0 && (
          <div
            className="
            mt-12
            flex
            flex-col
            items-center
            text-center
            text-zinc-500
            gap-3
          "
          >
            <FileSearch size={40} />

            <p className="text-sm">
              No research sessions found.
            </p>
          </div>
        )}

        {filteredHistory.map((session) => {
          const active =
            activeSession &&
            activeSession.id === session.id;

          return (
            <div
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`
                mb-3
                rounded-xl
                border
                cursor-pointer
                transition-all
                group
                ${
                  active
                    ? "border-blue-500 bg-blue-500/10"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }
              `}
            >
              <div className="p-4">

                <div className="flex justify-between items-start gap-3">

                  <h4
                    className="
                    text-sm
                    font-semibold
                    leading-5
                    line-clamp-2
                  "
                  >
                    {session.topic}
                  </h4>

                  <button
                    onClick={(e) =>
                      onDeleteSession(session.id, e)
                    }
                    className="
                    opacity-0
                    group-hover:opacity-100
                    transition
                    p-1
                    rounded-lg
                    hover:bg-red-500/20
                    text-red-400
                  "
                  >
                    <Trash2 size={15} />
                  </button>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <div
                    className="
                    flex
                    items-center
                    gap-1
                    text-xs
                    text-zinc-500
                  "
                  >
                    <Calendar size={12} />
                    {formatDate(session.created_at)}
                  </div>

                  <span
                    className={`
                      text-[10px]
                      px-2
                      py-1
                      rounded-full
                      font-medium
                      ${
                        session.status === "completed"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : session.status === "running"
                          ? "bg-blue-500/15 text-blue-400"
                          : "bg-zinc-700 text-zinc-300"
                      }
                    `}
                  >
                    {session.status}
                  </span>

                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}

      <div
        className="
        border-t
        border-zinc-800
        p-4
        text-xs
        text-zinc-500
      "
      >
        <p>
          Sessions
        </p>

        <p className="mt-1 text-white font-semibold">
          {history.length}
        </p>
      </div>
    </aside>
  );
}