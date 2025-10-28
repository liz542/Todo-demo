import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { formatISO } from "date-fns";
import { auth, signInWithGoogle, logOut, db, requestNotificationPermission } from "./firebase";
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [due, setDue] = useState("");
  const [category, setCategory] = useState("General");

  // ------------------------------
  // 🔹 Auth state change listener
  // ------------------------------
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        const loaded = await loadTasks(u);
        setTasks(loaded);
      } else {
        setTasks([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // ------------------------------
  // 🔹 Load tasks from Firestore
  // ------------------------------
  async function loadTasks(user) {
    try {
      const tasksRef = collection(db, `users/${user.uid}/tasks`);
      const snapshot = await getDocs(tasksRef);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error("❌ Error loading tasks:", err);
      return [];
    }
  }

  // ------------------------------
  // 🔹 Add a new task
  // ------------------------------
  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask = {
      id: uuidv4(),
      title,
      priority,
      due,
      category,
      createdAt: formatISO(new Date()),
      done: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setTitle("");

    if (user) {
      try {
        const tasksRef = collection(db, `users/${user.uid}/tasks`);
        await addDoc(tasksRef, newTask);
      } catch (err) {
        console.error("❌ Error adding task:", err);
      }
    }
  }

  // ------------------------------
  // 🔹 Delete a task
  // ------------------------------
  async function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (user) {
      try {
        const taskRef = doc(db, `users/${user.uid}/tasks/${id}`);
        await deleteDoc(taskRef);
      } catch (err) {
        console.error("❌ Error deleting task:", err);
      }
    }
  }

  // ------------------------------
  // 🔹 Toggle done/undone
  // ------------------------------
  function toggleDone(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );
  }

  // ------------------------------
  // 🔹 Login / Logout
  // ------------------------------
  async function handleLogin() {
    try {
      await signInWithGoogle();
      await requestNotificationPermission();
    } catch (err) {
      console.error("❌ Login failed:", err);
    }
  }

  function handleLogout() {
    logOut();
  }

  // ------------------------------
  // 🔹 UI
  // ------------------------------
  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="h1">To-Do List</div>
          <div className="small">
            Simple • Mobile-friendly • Google Login • Firestore Sync
          </div>
        </div>
        <div>
          {user ? (
            <button className="button" onClick={handleLogout}>
              Sign out
            </button>
          ) : (
            <button className="button" onClick={handleLogin}>
              Sign in with Google
            </button>
          )}
        </div>
      </div>

      {user && (
        <form onSubmit={addTask} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task..."
          />
          <select
            className="input"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
          <input
            className="input"
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
          />
          <button className="button" type="submit">
            Add
          </button>
        </form>
      )}

      <div className="tasks">
        {tasks.length === 0 ? (
          <div className="note">No tasks yet.</div>
        ) : (
          tasks.map((t) => (
            <div key={t.id} className="task">
              <div>
                <div style={{ fontWeight: 600 }}>{t.title}</div>
                <div className="small">
                  {t.priority} • {t.due || "no due date"}
                </div>
              </div>
              <div className="controls">
                <button className="button" onClick={() => toggleDone(t.id)}>
                  {t.done ? "Undone" : "Done"}
                </button>
                <button className="button" onClick={() => deleteTask(t.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!user && (
        <div style={{ marginTop: 14 }} className="note">
          Sign in with Google to save tasks to the cloud.
        </div>
      )}
    </div>
  );
}

export default App;
