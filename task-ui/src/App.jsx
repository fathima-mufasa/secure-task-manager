import { useAuthContext } from "@asgardeo/auth-react";
import { useEffect, useMemo, useState } from "react";
import "./App.css";

const API = "http://localhost:9090/api";

function App() {
  const { state, signIn, signOut, getBasicUserInfo } = useAuthContext();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [apiStatus, setApiStatus] = useState("checking...");

  useEffect(() => {
    if (state?.isAuthenticated) {
      getBasicUserInfo().then(setUser).catch(() => {});
      loadTasks();
    }
  }, [state?.isAuthenticated]);

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.text()).then(setApiStatus).catch(() => setApiStatus("backend not running"));
  }, []);

  async function loadTasks() {
    try {
      const res = await fetch(`${API}/tasks`);
      setTasks(await res.json());
    } catch {}
  }

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description: desc, priority })
    });
    const created = await res.json();
    setTasks([...tasks, created]);
    setTitle(""); setDesc("");
  }

  async function toggleTask(t) {
    const res = await fetch(`${API}/tasks/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t.title, description: t.description, priority: t.priority, done: !t.done })
    });
    const updated = await res.json();
    setTasks(tasks.map(x => x.id === t.id ? updated : x));
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter(x => x.id !== id));
  }

  const filtered = useMemo(() => {
    return tasks.filter(t => {
      const matchQ = (t.title + " " + (t.description || "")).toLowerCase().includes(query.toLowerCase());
      const matchF = filter === "All" || (filter === "Done" ? t.done : !t.done);
      return matchQ && matchF;
    });
  }, [tasks, query, filter]);

  const doneCount = tasks.filter(t => t.done).length;

  if (!state?.isAuthenticated) {
    return (
      <div className="page">
        <div className="hero-login">
          <div className="login-card">
            <div className="badge">WSO2 ASGARDEO + BALLERINA PROJECT</div>
            <h1>Secure Task Manager</h1>
            <p className="sub">Enterprise login with Email OTP MFA + Ballerina REST API. Built for WSO2 Engineering Internship.</p>
            <div className="stack"><span>React</span><span>Asgardeo OIDC</span><span>MFA</span><span>Ballerina API</span></div>
            <button className="btn-primary" onClick={() => signIn()}>Sign In with Asgardeo</button>
            <div className="fine">New here? Use self-registration on login page. Takes 30 seconds.</div>
            <div className="status">API: {apiStatus}</div>
          </div>
        </div>
      </div>
    );
  }

  const initial = (user?.username || user?.email || "F")[0].toUpperCase();

  return (
    <div className="page">
      <div className="topbar">
        <h2>Secure Task Manager</h2>
        <div className="user-pill">
          <div className="avatar">{initial}</div>
          <span>{user?.username || user?.email || "user"}</span>
          <button className="btn-ghost" onClick={() => signOut()}>Sign Out</button>
        </div>
      </div>

      <div className="container">
        <div className="stats">
          <div className="stat"><b>{tasks.length}</b><span>Total tasks</span></div>
          <div className="stat"><b>{doneCount}</b><span>Completed</span></div>
          <div className="stat"><b>{tasks.length - doneCount}</b><span>Pending</span></div>
        </div>

        <div className="add-card">
          <form onSubmit={addTask}>
            <div className="add-row">
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done? e.g. Prepare WSO2 demo" />
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option>High</option><option>Medium</option><option>Low</option>
              </select>
              <button className="btn-add" type="submit">+ Add Task</button>
            </div>
            <div className="add-row" style={{ marginTop: 8 }}>
              <input type="text" value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description (optional) — e.g. API + auth + screenshots for internship" />
            </div>
          </form>
        </div>

        <div className="toolbar">
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks..." />
          {["All", "Pending", "Done"].map(f => (
            <button key={f} className={filter === f ? "chip active" : "chip"} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>

        <div className="task-list">
          {filtered.length === 0 ? <div className="empty">No tasks found. Add your first task above to impress WSO2.</div> :
            filtered.map(t => (
              <div key={t.id} className={t.done ? "task done" : "task"}>
                <input type="checkbox" className="task-check" checked={t.done} onChange={() => toggleTask(t)} />
                <div className="task-body">
                  <div className="task-title">{t.title}<span className={`pri ${t.priority}`}>{t.priority}</span></div>
                  {t.description && <div className="task-desc">{t.description}</div>}
                </div>
                <button className="btn-del" onClick={() => deleteTask(t.id)}>Delete</button>
              </div>
            ))}
        </div>

        <div className="footer">Secured by WSO2 Asgardeo (OIDC + Email OTP MFA) • API by WSO2 Ballerina • {apiStatus}</div>
      </div>
    </div>
  );
}

export default App;
