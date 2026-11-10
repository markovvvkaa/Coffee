import { useState, type FormEvent } from 'react'
import Field from '../components/Field'
import Logo from '../components/Logo'
import { api, ApiError } from './api'

interface Props {
  notice?: string
  onSuccess: (token: string, login: string) => void
}

export default function LoginForm({ notice, onSuccess }: Props) {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<{ login?: string; password?: string }>({})
  const [message, setMessage] = useState(notice ?? '')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const found = { login: login.trim() ? undefined : 'Введите логин', password: password ? undefined : 'Введите пароль' }
    setErrors(found)
    if (found.login || found.password) return
    setBusy(true)
    setMessage('')
    try {
      const res = await api.login(login.trim(), password)
      onSuccess(res.token, res.login)
    } catch (err) {
      setMessage(err instanceof ApiError ? err.message : 'Не удалось войти')
      setPassword('')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={submit} noValidate aria-labelledby="login-title">
        <a href="./" className="login__logo" aria-label="Coffee – на сайт"><Logo /></a>
        <h1 className="login__title" id="login-title">Вход в админ-панель</h1>
        <p className="login__lead">Управление меню кофейни</p>
        {message && <p className="login__error" role="alert">{message}</p>}
        <Field id="login" label="Логин" error={errors.login}>
          {(a) => <input {...a} className="input" name="username" autoComplete="username" value={login} onChange={(e) => setLogin(e.target.value)} />}
        </Field>
        <Field id="password" label="Пароль" error={errors.password}>
          {(a) => (
            <div className="login__password">
              <input {...a} className="input" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="login__eye" onClick={() => setShowPassword((v) => !v)} aria-pressed={showPassword}>
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          )}
        </Field>
        <button type="submit" className="btn btn--l login__submit" disabled={busy}>{busy ? 'Вход…' : 'Войти'}</button>
        <a className="login__back" href="./">← Вернуться на сайт</a>
      </form>
    </main>
  )
}
