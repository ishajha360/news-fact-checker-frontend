import { useState } from "react"
import "./Login.css"

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) return
    if (isRegister && !name) return
    setLoading(true)
    setError("")

    try {
      const url = isRegister
        ? "http://localhost:8080/api/auth/register"
        : "http://localhost:8080/api/auth/login"

      const body = isRegister
        ? { name, email, password }
        : { email, password }

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Something went wrong")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("userName", data.name)
      onLogin(data)

    } catch (err) {
      setError("Server se connect nahi ho pa raha")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-logo">FactCheck <span style={{ fontSize: "11px", background: "#667eea", color: "#fff", padding: "2px 8px", borderRadius: "99px" }}>AI</span></div>
        <div className="auth-subtitle">
          {isRegister ? "Create your account" : "Welcome back — sign in"}
        </div>

        {error && <div className="auth-error">{error}</div>}

        {isRegister && (
          <>
            <label className="auth-label">Name</label>
            <input
              className="auth-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </>
        )}

        <label className="auth-label">Email</label>
        <input
          className="auth-input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label className="auth-label">Password</label>
        <input
          className="auth-input"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
        </button>

        <div className="auth-switch">
          {isRegister ? (
            <>Already have an account? <span onClick={() => setIsRegister(false)}>Login</span></>
          ) : (
            <>New user? <span onClick={() => setIsRegister(true)}>Register</span></>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login