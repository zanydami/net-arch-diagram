import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../lib/supabase';

interface Props {
  onClose: () => void;
}

export default function AuthDialog({ onClose }: Props) {
  const dialogRef = useRef<HTMLElement>(null);
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    dialogRef.current?.querySelector<HTMLInputElement>('input')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [onClose]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError('');
    setMessage('');

    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

    setBusy(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'sign-up' && !result.data.session) {
      setMessage('Проверьте почту и подтвердите регистрацию.');
      return;
    }

    onClose();
  };

  return createPortal((
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        ref={dialogRef}
        className="reference-directory-panel w-full max-w-sm rounded-lg border border-slate-200 bg-white p-5 shadow-2xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase text-slate-500">Supabase Auth</p>
            <h2 id="auth-title" className="mt-1 text-lg font-semibold text-slate-900">
              {mode === 'sign-in' ? 'Вход' : 'Создать аккаунт'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className="-mt-1 text-2xl leading-none text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <label className="block text-xs font-medium text-slate-600">
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Пароль
            <input
              required
              type="password"
              minLength={6}
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            />
          </label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="text-sm text-teal-800">{message}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-md bg-teal-800 px-3 py-2 text-sm font-medium text-white transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? 'Подождите…' : mode === 'sign-in' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-500">
          {mode === 'sign-in' ? 'Нет аккаунта?' : 'Уже зарегистрированы?'}{' '}
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in');
              setError('');
              setMessage('');
            }}
            className="font-medium text-teal-800 underline-offset-2 hover:underline"
          >
            {mode === 'sign-in' ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </section>
    </div>
  ), document.body);
}