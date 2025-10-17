// src/firebase.js - placeholders. Replace with your Firebase config.
export function initFirebase(){
  console.log('initFirebase placeholder')
}

export const auth = {
  onAuthStateChanged: (cb) => { return () => {} },
  signInWithGoogle: async () => { throw new Error('Not configured') },
  signOut: async () => {}
};

export async function requestNotificationPermission(){
  if (!('Notification' in window)) return
  const permission = await Notification.requestPermission()
  if (permission === 'granted') console.log('Notifications permission granted.')
}
