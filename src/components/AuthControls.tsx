import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import AuthDialog from './AuthDialog';

export default function AuthControls() {
  const { session, role, loading } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  if (!supabase) return null;

  return (
    <>
      {loading ? (
        <span className="px-2 text-xs text-slate-500">Проверка входа…</span>
      ) : session ? (
        <div className="flex min-w-0 items-center gap-2">
          <span className="hidden max-w-36 truncate text-xs text-slate-500 sm:block" title={session.user.email}>
            {role === 'admin' ? 'Администратор' : role === 'editor' ? 'Редактор' : 'Читатель'}
          </span>
          <button
            type="button"
            onClick={() => void supabase.auth.signOut()}
            className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Выйти
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setDialogOpen(true)}
          className="shrink-0 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Войти
        </button>
      )}
      {dialogOpen && <AuthDialog onClose={() => setDialogOpen(false)} />}
    </>
  );
}