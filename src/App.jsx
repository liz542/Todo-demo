import React, {useEffect, useState} from 'react'
import { initFirebase, auth, requestNotificationPermission } from './firebase'
import { v4 as uuidv4 } from 'uuid'
import { formatISO } from 'date-fns'

initFirebase()

function App(){
  const [user, setUser] = useState(null)
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [due, setDue] = useState('')
  const [category, setCategory] = useState('General')

  useEffect(()=>{
    const unsub = (auth && auth.onAuthStateChanged) ? auth.onAuthStateChanged(u=>{
      setUser(u)
      if(u){
        const raw = localStorage.getItem('td_tasks_'+u.uid)
        if(raw) setTasks(JSON.parse(raw))
      } else {
        setTasks([])
      }
    }) : ()=>{}
    return ()=>unsub && unsub()
  },[])

  useEffect(()=>{
    if(user) localStorage.setItem('td_tasks_'+user.uid, JSON.stringify(tasks))
  },[tasks,user])

  async function handleLogin(){
    if(auth && auth.signInWithGoogle) {
      await auth.signInWithGoogle()
      await requestNotificationPermission()
    } else {
      alert('Firebase auth not configured. See README.')
    }
  }
  function handleLogout(){ if(auth && auth.signOut) auth.signOut() }

  function addTask(e){
    e.preventDefault()
    if(!title.trim()) return
    const id = uuidv4()
    const newTask = { id, title, priority, due, category, createdAt: formatISO(new Date()), recurring: null }
    setTasks(prev=>[newTask,...prev])
    setTitle('')
  }

  function toggleDone(id){
    setTasks(prev=>prev.map(t=> t.id===id ? {...t, done: !t.done} : t))
  }

  function deleteTask(id){
    setTasks(prev=>prev.filter(t=>t.id!==id))
  }

  return (
    <div className="app">
      <div className="header">
        <div>
          <div className="h1">To-Do List</div>
          <div className="small">Simple • Mobile-friendly • Google Login</div>
        </div>
        <div>
          {user ? <button className="button" onClick={handleLogout}>Sign out</button> : <button className="button" onClick={handleLogin}>Sign in with Google</button>}
        </div>
      </div>

      <form onSubmit={addTask} style={{display:'flex',gap:8,marginBottom:12}}>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Add a task..." />
        <select className="input" value={priority} onChange={e=>setPriority(e.target.value)}>
          <option>High</option><option>Medium</option><option>Low</option>
        </select>
        <input className="input" type="date" value={due} onChange={e=>setDue(e.target.value)} />
        <button className="button" type="submit">Add</button>
      </form>

      <div className="tasks">
        {tasks.length===0 ? <div className="note">No tasks yet.</div> : tasks.map(t=>(
          <div key={t.id} className="task">
            <div>
              <div style={{fontWeight:600}}>{t.title}</div>
              <div className="small">{t.priority} • {t.due || 'no due date'}</div>
            </div>
            <div className="controls">
              <button className="button" onClick={()=>toggleDone(t.id)}>{t.done ? 'Undone' : 'Done'}</button>
              <button className="button" onClick={()=>deleteTask(t.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:14}} className="note">Preview demo: notifications, storage, and server sync require Firebase config (see README).</div>
    </div>
  )
}

export default App
