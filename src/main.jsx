import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')).render(<App />)
const { auth } = initFirebase(); // Initialize Firebase
const app = createApp(App);
app.provide('auth', auth);
app.mount('#app');
