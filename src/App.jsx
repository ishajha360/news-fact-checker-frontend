import { useState } from "react"
import "./App.css"
import Login from "./Login"

const API_URL = "https://news-fact-checker-backend-1.onrender.com"

const scoreColor = (s) =>
  s >= 70 ? "#4ade80" : s >= 40 ? "#fbbf24" : "#f87171"

const scoreBg = (s) =>
  s >= 70 ? "#1a3a1a" : s >= 40 ? "#3a2e0a" : "#3a0a0a"

const pillClass = (s) =>
  s >= 70
    ? "score-pill pill-green"
    : s >= 40
      ? "score-pill pill-yellow"
      : "score-pill pill-red"

function App() {
  const [text, setText] = useState("")

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("factcheck-history")
    return saved ? JSON.parse(saved) : []
  })

  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)

  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("userName")

    return token ? { token, name } : null
  })

  const handleLogin = (data) => {
    setUser({
      token: data.token,
      name: data.name,
    })
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userName")
    localStorage.removeItem("factcheck-history")

    setUser(null)
    setHistory([])
    setSelected(null)
  }

  const analyze = async () => {
    if (!text.trim()) return

    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/api/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({ text }),
        }
      )

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()

      const entry = {
        id: Date.now(),
        headline:
          text.length > 80
            ? text.slice(0, 80) + "…"
            : text,
        time: "Just now",
        result: data,
      }

      const updated = [entry, ...history]

      setHistory(updated)

      localStorage.setItem(
        "factcheck-history",
        JSON.stringify(updated)
      )

      setSelected(entry)
      setText("")
    } catch (err) {
      console.error("Error analyzing article:", err)
    } finally {
      setLoading(false)
    }
  }

  const dims = selected
    ? [
        {
          label: "Source reliability",
          value: selected.result.scores.sourceReliability,
        },
        {
          label: "Factual accuracy",
          value: selected.result.scores.factualAccuracy,
        },
        {
          label: "Bias level",
          value: selected.result.scores.biasLevel,
        },
        {
          label: "Claim verifiability",
          value: selected.result.scores.claimVerifiability,
        },
      ]
    : []

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">

      <div className="sidebar">

        <div className="sidebar-header">

          <span className="logo">
            FactCheck
          </span>

          <span className="badge">
            AI
          </span>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <span
              style={{
                fontSize: "12px",
                color: "#aaa",
              }}
            >
              Hi, {user.name}
            </span>

            <button
              onClick={handleLogout}
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                background: "#3a0a0a",
                color: "#f87171",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </div>

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
            <div className="recent-label">
              Recent Articles
            </div>

            <div className="feed">

              {history.map((item) => (
                <div
                  key={item.id}
                  className={`article-card ${
                    selected?.id === item.id
                      ? "active"
                      : ""
                  }`}
                  onClick={() => setSelected(item)}
                >

                  <div className="card-top">

                    <div className="card-headline">
                      {item.headline}
                    </div>

                    <span
                      className={pillClass(
                        item.result.overallScore
                      )}
                    >
                      {item.result.overallScore}
                    </span>

                  </div>

                  <div className="card-meta">
                    {item.time}
                  </div>

                </div>
              ))}

            </div>
          </>
        )}

      </div>

      <div className="main">

        {!selected && !loading && (
          <div className="empty-state">
            <span style={{ fontSize: "32px" }}>
              🔍
            </span>

            <p>
              Paste text and click Analyze
            </p>
          </div>
        )}

        {loading && (
          <div className="empty-state">
            <span style={{ fontSize: "32px" }}>
              ⏳
            </span>

            <p>
              Analyzing article...
            </p>
          </div>
        )}

        {selected && !loading && (
          <>
            <div className="main-header">

              <div className="main-title">
                {selected.headline}
              </div>

              <div className="main-meta">
                {selected.time}
              </div>

            </div>

            <div className="main-body">

              <div className="overall-box">

                <div className="big-score">
                  {selected.result.overallScore}
                  <span>/100</span>
                </div>

                <div>

                  <div className="verdict-label">
                    Overall credibility score
                  </div>

                  <div
                    className="verdict-text"
                    style={{
                      color: scoreColor(
                        selected.result.overallScore
                      ),
                    }}
                  >
                    {selected.result.verdict}
                  </div>

                </div>

              </div>

              <div className="dims">

                {dims.map((dim) => (
                  <div
                    key={dim.label}
                    className="dim-card"
                  >

                    <div className="dim-name">
                      {dim.label}
                    </div>

                    <div className="dim-score">
                      {dim.value}
                      <span>/100</span>
                    </div>

                    <div className="bar-bg">

                      <div
                        className="bar-fill"
                        style={{
                          width: `${dim.value}%`,
                          background: scoreColor(
                            dim.value
                          ),
                        }}
                      />

                    </div>

                  </div>
                ))}

              </div>

              <div className="claims-label">
                Claim Analysis
              </div>

              <div className="claims">

                {selected.result.claims.map(
                  (claim, i) => {

                    const claimScore =
                      claim.status === "VERIFIED"
                        ? 80
                        : claim.status === "MIXED"
                          ? 50
                          : 20

                    return (
                      <div
                        key={i}
                        className="claim-item"
                      >

                        <span
                          className="claim-icon"
                          style={{
                            color: scoreColor(
                              claimScore
                            ),
                          }}
                        >
                          {claim.status === "VERIFIED"
                            ? "✓"
                            : claim.status === "MIXED"
                              ? "⚠"
                              : "✗"}
                        </span>

                        <div>

                          <div>
                            {claim.claim}
                          </div>

                          <span
                            className="status-pill"
                            style={{
                              background:
                                scoreBg(claimScore),
                              color:
                                scoreColor(claimScore),
                            }}
                          >
                            {claim.status}
                          </span>

                        </div>

                      </div>
                    )
                  }
                )}

              </div>

            </div>
          </>
        )}

      </div>

    </div>
  )
}

export default App