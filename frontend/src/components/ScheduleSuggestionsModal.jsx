import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import api from "../api/axios.js";
import { CATEGORY_LIST, getCategoryMeta } from "../utils/categoryMeta.js";
import { toISODate } from "../utils/dateUtils.js";

export default function ScheduleSuggestionsModal({ date, onAddSuggestion, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingIndex, setAddingIndex] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.post("/ai/suggest-schedule", {
          date: toISODate(date),
          categories: CATEGORY_LIST,
        });
        setSuggestions(data.suggestions);
      } catch (err) {
        setError(err.response?.data?.message || "Couldn't get suggestions right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, [date]);

  const handleAdd = async (suggestion, index) => {
    setAddingIndex(index);
    try {
      await onAddSuggestion(suggestion);
      setSuggestions((prev) => prev.filter((_, i) => i !== index));
    } catch(error) {
        console.error(error.message);
      setError("Couldn't add that block — try again.");
    } finally {
      setAddingIndex(null);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex-row gap-2 mb-1">
          <Sparkles size={18} color="var(--color-accent)" />
          <h3 className="modal-title" style={{ margin: 0 }}>Schedule suggestions</h3>
        </div>
        <p className="text-sm text-muted mb-3">
          Based on your pending goals and free time this day.
        </p>

        {loading && <p className="text-muted">Thinking...</p>}
        {!loading && error && <p className="error-text">{error}</p>}
        {!loading && !error && suggestions.length === 0 && (
          <p className="text-muted">
            No suggestions — either no pending goals, no free time left this day, or you've added them all.
          </p>
        )}

        {!loading && suggestions.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {suggestions.map((s, i) => {
              const meta = getCategoryMeta(s.category);
              const isAdding = addingIndex === i;
              return (
                <div key={i} className="card" style={{ borderLeft: `4px solid ${meta.color}` }}>
                  <div className="flex-between mb-1">
                    <span className="badge" style={{ background: meta.color }}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="time-mono text-xs text-muted">{s.startTime}–{s.endTime}</span>
                  </div>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  {s.reason && <p className="text-xs text-muted" style={{ margin: "4px 0" }}>{s.reason}</p>}
                  <button
                    className="btn btn-sm btn-primary"
                    disabled={isAdding}
                    onClick={() => handleAdd(s, i)}
                    style={{ marginTop: 6 }}
                  >
                    {isAdding ? "Adding..." : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 14 }}>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}