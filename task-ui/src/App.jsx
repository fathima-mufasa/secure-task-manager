import { useAuthContext } from "@asgardeo/auth-react";
import { useEffect, useState } from "react";

const API = "http://localhost:9090/api";

function App() {
  const { state, signIn, signOut, getBasicUserInfo } = useAuthContext();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [apiStatus, setApiStatus] = useState("checking...");

  useEffect(() => {
    if (state?.isAuthenticated) {
      getBasicUserInfo().then(setUser).catch(console.error);
      loadTasks();
    }
  }, [state?.isAuthenticated]);

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.text()).then(setApiStatus).catch(() => setApiStatus("backend not running - start Ballerina on :9090"));
  }, []);

  async function loadTasks() {
    try {
      const res = await fetch(`${API}/tasks`);
      const data = await res.json();
      setTasks(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const res = await fetch(`${API}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    const created = await res.json();
    setTasks([...tasks, created]);
    setTitle("");
  }

  async function toggleTask(t) {
    const res = await fetch(`${API}/tasks/${t.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: t.title, done: !t.done })
    });
    const updated = await res.json();
    setTasks(tasks.map(x => x.id === t.id ? updated : x));
  }

  async function deleteTask(id) {
    await fetch(`${API}/tasks/${id}`, { method: "DELETE" });
    setTasks(tasks.filter(x => x.id !== id));
  }

  if (!state?.isAuthenticated) {
    return (
      <div style={{ maxWidth: 640, margin: "60px auto", fontFamily: "sans-serif", textAlign: "center" }}>
        <h1>Secure Task Manager</h1>
        <p>Built with <b>WSO2 Asgardeo</b> (auth + MFA) + <b>WSO2 Ballerina</b> (REST API) + React</p>
        <p style={{ fontSize: 13, color: "#555" }}>Backend: {apiStatus}</p>
        <button onClick={() => signIn()} style={{ padding: "12px 24px", fontSize: 16, cursor: "pointer" }}>
          Sign In with Asgardeo
        </button>
        <p style={{ marginTop: 20, fontSize: 13 }}>New user? Use Sign In page self-registration. Email OTP MFA is enabled.</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "30px auto", fontFamily: "sans-serif" }}>
      <h1>Secure Task Manager</h1>
      <p>Welcome <b>{user?.username || user?.email || "user"}</b> {user?.email ? `(${user.email})` : ""}</p>
      <p style={{ fontSize: 13, color: "#555" }}>WSO2 Asgardeo authenticated + Email OTP MFA | Ballerina API: {apiStatus}</p>
      <button onClick={() => signOut()}>Sign Out</button>
      <hr />
      <form onSubmit={addTask} style={{ margin: "20px 0" }}>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task title" style={{ padding: 8, width: "70%" }} />
        <button type="submit" style={{ padding: 8, marginLeft: 8 }}>Add</button>
      </form>
      {tasks.length === 0 ? <p>No tasks yet. Add one above.</p> : (
        <ul>
          {tasks.map(t => (
            <li key={t.id} style={{ marginBottom: 8 }}>
              <input type="checkbox" checked={t.done} onChange={() => toggleTask(t)} />{" "}
              <span style={{ textDecoration: t.done ? "line-through" : "none" }}>{t.title}</span>{" "}
              <button onClick={() => deleteTask(t.id)} style={{ marginLeft: 8 }}>Delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
