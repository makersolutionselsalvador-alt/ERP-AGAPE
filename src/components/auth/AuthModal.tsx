import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Lock, Mail, User, ShieldCheck, X, ArrowRight, Check } from 'lucide-react';
import { AgapeLogo } from '../common/AgapeLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'changePassword' | 'forgotPassword';
  setMode: (m: 'login' | 'changePassword' | 'forgotPassword') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode, setMode }) => {
  const { login, currentUser, changePassword, resetPassword, users, showToast } = useApp();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password)) {
      onClose();
    }
  };

  const handleChangePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    if (currentUser && changePassword(currentUser.id, newPassword)) {
      onClose();
    }
  };

  const handleForgotPass = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPassword(email)) {
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <AgapeLogo size={32} showText={false} variant="isologo" className="shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {mode === 'login' && 'Iniciar Sesión (RF-001)'}
                {mode === 'changePassword' && 'Cambiar Contraseña (RF-003)'}
                {mode === 'forgotPassword' && 'Recuperar Contraseña (RF-004)'}
              </h3>
              <p className="text-[11px] text-amber-800 font-medium">Asociación Ágape de El Salvador — Control de Acceso</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Usuario o Correo
                </label>
                <div className="relative">
                  <User className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="admin, carlos.cajero..."
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgotPassword')}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Fast switch user presets for testing */}
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Accesos Rápidos Demo:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {users.map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setUsername(u.username);
                        setPassword('demo123');
                      }}
                      className="text-left px-2 py-1 rounded bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 text-[11px] transition-colors truncate"
                    >
                      <span className="font-semibold block truncate">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
              >
                <span>Acceder al Sistema</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          )}

          {mode === 'changePassword' && (
            <form onSubmit={handleChangePass} className="space-y-4">
              <p className="text-xs text-slate-600">
                Actualiza tu clave de acceso para la cuenta{' '}
                <strong className="text-slate-900">{currentUser?.username}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="Mínimo 4 caracteres"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  placeholder="Repite la contraseña"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Guardar Contraseña
                </button>
              </div>
            </form>
          )}

          {mode === 'forgotPassword' && (
            <form onSubmit={handleForgotPass} className="space-y-4">
              <p className="text-xs text-slate-600">
                Ingresa tu correo institucional registrado para enviar el enlace de recuperación y restablecer tu clave.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    placeholder="usuario@agape.com.sv"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Volver al Login
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Enviar Instrucciones
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
