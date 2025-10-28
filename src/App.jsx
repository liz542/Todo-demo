import React, { useEffect, useState } from 'react'
import { initFirebase, auth, db, requestNotificationPermission } from './firebase'
import { v4 as uuidv4 } from 'uuid'
import { formatISO } from 'date-fns'
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth"

initFirebase()

function App() {
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [due, setDue] = useState('')
  const [category, setCategory] = useState('General')

  // --- Auth state listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (u) loadTasks(u.uid)
      else setTasks([])
    })
    return () => unsubscribe()
  }, [])

  // --- Load tasks from Firestore ---
  const loadTasks = (uid) => {
    const q = query(collection(db, 'tasks'), where('uid', '==', uid))
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setTasks(docs.sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
    })
    return () => unsub()
  }

  // --- Add a new task ---
  const addTask = async (e) => {
    e.preventDefault()
    if (!title.trim() || !user) return
    const newTask = {
      uid: user.uid,
      title,
      priority,
      due,
      category,
      done: false,
      createdAt: formatISO(new Date())
    }
    await addDoc(collection(db, 'tasks'), newTask)
    setTitle('')
  }

  // --- Toggle task done ---
  const toggleDone = async (task) => {
    await updateDoc(doc(db, 'tasks', task.id), { done: !task.done })
  }

  // --- Delete a task ---
  const deleteTask = async (task) => {
    await deleteDoc(doc(db, 'tasks', task.id))
  }

  // --- Sign in/out ---
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
    await requestNotificationPermission()
  }
  const handleLogout = () => signOut(auth)

  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="h1">To-Do List</div>
          <div className="small">Synced • Google Login • Priority</div>
        </div>
        <div>
          {user ? (
            <button className="button" onClick={handleLogout}>Sign out</button>
          ) : (
            <button className="button" onClick={handleLogin}>Sign in with Google</button>
          )}
        </div>
      </div>

      {user && (
        <>
          <form onSubmit={addTask} style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              className="input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a task..."
            />
            <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
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
            <button className="button" type="submit">Add</button>
          </form>

          <div className="tasks">
            {tasks.length === 0 ? (
              <div className="note">No tasks yet.</div>
            ) : (
              tasks.map((t) => (
                <div key={t.id} className="task">
                  <div>
                    <div style={{ fontWeight: 600 }}>{t.title}</div>
                    <div className="small">
                      {t.priority} • {t.due || 'no due date'}
                    </div>
                  </div>
                  <div className="controls">
                    <button className="button" onClick={() => toggleDone(t)}>
                      {t.done ? 'Undone' : 'Done'}
                    </button>
                    <button className="button" onClick={() => deleteTask(t)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default App
