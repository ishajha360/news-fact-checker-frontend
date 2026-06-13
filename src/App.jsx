import { useState } from "react"
import "./App.css"

const scoreColor = (s) => s >= 70 ? "#4ade80" : s >= 40 ? "#fbbf24" : "#f87171"
const scoreBg = (s) => s >= 70 ? "#1a3a1a" : s >= 40 ? "#3a2e0a" : "#3a0a0a"
const pillClass = (s) => s >= 70 ? "score-pill pill-green" : s >= 40 ? "score-pill pill-yellow" : "score-pill pill-red"

function App() {
  const [text, setText] = useState("")
  const [history, setHistory] = useState(() => {
  const saved = localStorage.getItem("factcheck-history")
  return saved ? JSON.parse(saved) : []
})
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const analyze = async () => {
  if (!text.trim()) return
  setLoading(true)
  try {
    const response = await fetch("http://localhost:8080/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    })
    const data = await response.json()
    const entry = {
      id: Date.now(),
      headline: text.length > 80 ? text.slice(0, 80) + "…" : text,
      time: "Just now",
      result: data
    }
    const updated = [entry, ...history]
    setHistory(updated)
    localStorage.setItem("factcheck-history", JSON.stringify(updated))
    setSelected(entry)
    setText("")
  } catch (err) {
    console.error("Error:", err)
  }
  setLoading(false)
}

  const dims = selected ? [
    { label: "Source reliability", value: selected.result.scores.sourceReliability },
    { label: "Factual accuracy", value: selected.result.scores.factualAccuracy },
    { label: "Bias level", value: selected.result.scores.biasLevel },
    { label: "Claim verifiability", value: selected.result.scores.claimVerifiability },
  ] : []

  return (
    <div className="app">
      {/* LEFT SIDEBAR */}
      <div className="sidebar">
        <div className="sidebar-header">
          <span className="logo">FactCheck</span>
          <span className="badge">AI</span>
        </div>

        <div className="paste-section">
          <textarea
            placeholder="Paste article text to verify..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button
            className="analyze-btn"
            onClick={analyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze ↗"}
          </button>
        </div>

        {history.length > 0 && (
          <>
            <div className="recent-label">Recent Articles</div>
            <div className="feed">
              {history.map((item) => (
                <div
                  key={item.id}
                  className={`article-card ${selected?.id === item.id ? "active" : ""}`}
                  onClick={() => setSelected(item)}
                >
                  <div className="card-top">
                    <div className="card-headline">{item.headline}</div>
                    <span className={pillClass(item.result.overallScore)}>
                      {item.result.overallScore}
                    </span>
                  </div>
                  <div className="card-meta">{item.time}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* RIGHT MAIN */}
      <div className="main">
        {!selected && !loading && (
          <div className="empty-state">
            <span style={{ fontSize: "32px" }}>🔍</span>
            <p>Paste text and click Analyze</p>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <span style={{ fontSize: "32px" }}>⏳</span>
            <p>Analyzing article...</p>
          </div>
        )}

        {selected && !loading && (
          <>
            <div className="main-header">
              <div className="main-title">{selected.headline}</div>
              <div className="main-meta">{selected.time}</div>
            </div>

            <div className="main-body">
              {/* Overall score */}
              <div className="overall-box">
                <div className="big-score">
                  {selected.result.overallScore}<span>/100</span>
                </div>
                <div>
                  <div className="verdict-label">Overall credibility score</div>
                  <div className="verdict-text" style={{ color: scoreColor(selected.result.overallScore) }}>
                    {selected.result.verdict}
                  </div>
                </div>
              </div>

              {/* Dimension scores */}
              <div className="dims">
                {dims.map((dim) => (
                  <div key={dim.label} className="dim-card">
                    <div className="dim-name">{dim.label}</div>
                    <div className="dim-score">
                      {dim.value}<span>/100</span>
                    </div>
                    <div className="bar-bg">
                      <div
                        className="bar-fill"
                        style={{ width: `${dim.value}%`, background: scoreColor(dim.value) }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Claims */}
              <div className="claims-label">Claim Analysis</div>
              <div className="claims">
                {selected.result.claims.map((claim, i) => (
                  <div key={i} className="claim-item">
                    <span
                      className="claim-icon"
                      style={{ color: scoreColor(claim.status === "VERIFIED" ? 80 : claim.status === "MIXED" ? 50 : 20) }}
                    >
                      {claim.status === "VERIFIED" ? "✓" : claim.status === "MIXED" ? "⚠" : "✗"}
                    </span>
                    <div>
                      <div>{claim.claim}</div>
                      <span
                        className="status-pill"
                        style={{
                          background: scoreBg(claim.status === "VERIFIED" ? 80 : claim.status === "MIXED" ? 50 : 20),
                          color: scoreColor(claim.status === "VERIFIED" ? 80 : claim.status === "MIXED" ? 50 : 20)
                        }}
                      >
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App