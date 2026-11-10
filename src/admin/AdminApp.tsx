import { useEffect, useState } from 'react'
import { api, getToken, setToken } from './api'
import Dashboard from './Dashboard'
import LoginForm from './LoginForm'

type Auth = { state: 'checking' } | { state: 'guest'; notice?: string } | { state: 'user'; login: string }

export default function AdminApp() {
  const [auth, setAuth] = useState<Auth>(() => (getToken() ? { state: 'checking' } : { state: 'guest' }))

  // при открытии страницы проверяем, действует ли сохранённый токен
  useEffect(() => {
    if (auth.state !== 'checking') return
    api.me().then((me) => setAuth({ state: 'user', login: me.login })).catch(() => setAuth({ state: 'guest' }))
  }, [auth.state])

  if (auth.state === 'checking') return <p className="admin-loading">Загрузка…</p>
  if (auth.state === 'guest') {
    return <LoginForm notice={auth.notice} onSuccess={(token, login) => { setToken(token); setAuth({ state: 'user', login }) }} />
  }
  return (
    <Dashboard
      login={auth.login}
      onLogout={async () => { await api.logout().catch(() => {}); setToken(null); setAuth({ state: 'guest' }) }}
      onExpired={() => { setToken(null); setAuth({ state: 'guest', notice: 'Сессия истекла, войдите снова.' }) }}
    />
  )
}
