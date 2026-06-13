import { useState, useEffect } from 'react'

export interface AuthUser {
  uid:             string
  displayName:     string
  email:           string
  provider:        'google' | 'apple' | 'guest' | 'email'
  token?:          string
  assignedServer?: string
}

const API = '/hooder-api'

// ── Firebase lazy init ────────────────────────────────────────────────────────

let _auth: import('firebase/auth').Auth | null = null

async function getFirebaseAuth() {
  if (_auth) return _auth
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  if (!apiKey) return null
  const { initializeApp, getApps } = await import('firebase/app')
  const { getAuth } = await import('firebase/auth')
  const cfg = {
    apiKey,
    authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  }
  const app = getApps().length ? getApps()[0] : initializeApp(cfg)
  _auth = getAuth(app)
  return _auth
}

// ── Email / Password auth (backend) ──────────────────────────────────────────

export async function registerWithEmail(
  username: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const res  = await fetch(`${API}/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ username, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Kayıt başarısız')
  return {
    uid:             data.user.uid ?? data.user.id,
    displayName:     data.user.username,
    email:           data.user.email,
    provider:        'email',
    token:           data.token,
    assignedServer:  data.assigned_server,
  }
}

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthUser> {
  const res  = await fetch(`${API}/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'E-posta veya şifre hatalı')
  return {
    uid:             data.user.uid ?? data.user.id,
    displayName:     data.user.username,
    email:           data.user.email,
    provider:        'email',
    token:           data.token,
    assignedServer:  data.assigned_server,
  }
}

// ── Social sign-in functions ──────────────────────────────────────────────────

export async function signInWithGoogle(): Promise<AuthUser> {
  const auth = await getFirebaseAuth()
  if (!auth) throw new Error('Firebase yapılandırılmamış')
  const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
  const result = await signInWithPopup(auth, new GoogleAuthProvider())
  return {
    uid:         result.user.uid,
    displayName: result.user.displayName ?? 'Oyuncu',
    email:       result.user.email ?? '',
    provider:    'google',
  }
}

export async function signInWithApple(): Promise<AuthUser> {
  const auth = await getFirebaseAuth()
  if (!auth) throw new Error('Firebase yapılandırılmamış')
  const { OAuthProvider, signInWithPopup } = await import('firebase/auth')
  const provider = new OAuthProvider('apple.com')
  provider.addScope('email')
  provider.addScope('name')
  const result = await signInWithPopup(auth, provider)
  return {
    uid:         result.user.uid,
    displayName: result.user.displayName ?? 'Oyuncu',
    email:       result.user.email ?? '',
    provider:    'apple',
  }
}

export function signInAsGuest(): AuthUser {
  let guestId = localStorage.getItem('hooder_guest_uid')
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).slice(2, 10)
    localStorage.setItem('hooder_guest_uid', guestId)
  }
  return { uid: guestId, displayName: 'Misafir', email: '', provider: 'guest' }
}

export async function doSignOut(): Promise<void> {
  const auth = await getFirebaseAuth()
  if (auth) {
    const { signOut } = await import('firebase/auth')
    await signOut(auth)
  }
}

// ── useAuth hook ──────────────────────────────────────────────────────────────

const USER_KEY = 'hooder_auth_user'

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  })
  const [loading, setLoading] = useState(false)

  const saveUser = (u: AuthUser | null) => {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u))
    else    localStorage.removeItem(USER_KEY)
    setUser(u)
  }

  const loginEmail = async (email: string, password: string) => {
    setLoading(true)
    try {
      const u = await loginWithEmail(email, password)
      saveUser(u)
    } finally { setLoading(false) }
  }

  const registerEmail = async (username: string, email: string, password: string) => {
    setLoading(true)
    try {
      const u = await registerWithEmail(username, email, password)
      saveUser(u)
    } finally { setLoading(false) }
  }

  const loginGoogle = async () => {
    setLoading(true)
    try {
      const u = await signInWithGoogle()
      saveUser(u)
    } finally { setLoading(false) }
  }

  const loginApple = async () => {
    setLoading(true)
    try {
      const u = await signInWithApple()
      saveUser(u)
    } finally { setLoading(false) }
  }

  const loginGuest = () => {
    saveUser(signInAsGuest())
  }

  const signOut = async () => {
    await doSignOut()
    localStorage.removeItem('hooder_selected_server')
    saveUser(null)
  }

  // Refresh token on mount for email users (optional future enhancement)
  useEffect(() => {}, [])

  const firebaseAvailable = !!import.meta.env.VITE_FIREBASE_API_KEY

  return {
    user,
    loading,
    loginEmail,
    registerEmail,
    loginGoogle,
    loginApple,
    loginGuest,
    signOut,
    firebaseAvailable,
  }
}
