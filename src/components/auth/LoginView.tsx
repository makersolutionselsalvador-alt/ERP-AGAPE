import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Lock,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Store,
  Boxes,
  Coins,
  ShieldAlert,
  CheckCircle2,
  KeyRound,
  RotateCcw
} from 'lucide-react';
import { getRoleBadgeInfo } from '../../utils/rbac';
import { AgapeLogo } from '../common/AgapeLogo';

export const LoginView: React.FC = () => {
  const { login, users, resetPassword, companySettings } = useApp();

  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySuccess, setRecoverySuccess] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!identifier.trim()) {
      setErrorMsg('Por favor ingrese su usuario o correo electrónico.');
      return;
    }

    const success = login(identifier, password);
    if (!success) {
      setErrorMsg('Credenciales inválidas o usuario inactivo. Revise los datos o seleccione un acceso rápido.');
    }
  };

  const handleQuickLogin = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setErrorMsg(null);
    login(username, pass);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    const ok = resetPassword(recoveryEmail);
    if (ok) {
      setRecoverySuccess(`Hemos enviado las instrucciones para restablecer su contraseña a: ${recoveryEmail}`);
      setTimeout(() => {
        setIsForgotPassword(false);
        setRecoverySuccess(null);
      }, 4000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden select-none">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* LEFT / HERO BRANDING SECTION (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-8 sm:p-10 flex flex-col justify-between text-white relative">
          <div>
            {/* System Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-6">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
              <span>Acceso Seguro ERP v2.5</span>
            </div>

            {/* App Wordmark */}
            <div className="flex items-center gap-3 mb-4">
              <AgapeLogo variant="badge" size="lg" />
              <div>
                <h1 className="text-xl font-black tracking-tight text-white leading-tight uppercase font-sans">
                  {companySettings.tradeName}
                </h1>
                <p className="text-xs text-amber-300 font-medium">Asociación AGAPE de El Salvador</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-4">
              Sistema integral de ventas y punto de venta (POS), inventarios con Kardex, facturación electrónica DTE 2.0 y control de caja.
            </p>

            {/* Feature highlights */}
            <div className="mt-6 space-y-3 pt-6 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2.5 text-slate-200">
                <Store className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Punto de Venta ágil para cajeros</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Boxes className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Inventarios, combos y trazabilidad</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-200">
                <Coins className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Cierres de caja y cuentas por cobrar</span>
              </div>
            </div>
          </div>

          <div className="pt-8 text-[11px] text-slate-400 border-t border-slate-800/80 flex items-center justify-between">
            <span>RF-001 / RF-009</span>
            <span className="font-mono text-slate-500">Local-Ready DB</span>
          </div>
        </div>

        {/* RIGHT / LOGIN FORM SECTION (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 bg-white flex flex-col justify-center">
          {!isForgotPassword ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Iniciar Sesión</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ingrese con sus credenciales autorizadas o seleccione un rol de prueba.
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
                  <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Usuario o Correo Electrónico
                  </label>
                  <div className="relative">
                    <User className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={e => setIdentifier(e.target.value)}
                      placeholder="admin, carlos.cajero..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Contraseña</label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                    >
                      ¿Olvidó su contraseña?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-2.5 bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Ingresar al Sistema</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {/* FAST DEMO ACCESS PRESETS (RF-008 & RF-009) */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    <span>Acceso Rápido por Perfil (1-Clic):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Clic para ingresar directo</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {users.slice(0, 4).map(u => {
                    const badge = getRoleBadgeInfo(u.role);
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickLogin(u.username, u.password || 'demo123')}
                        className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all group cursor-pointer"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-blue-900 truncate">
                            {u.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${badge.badgeBg} ${badge.badgeText}`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">
                          {u.username} • {u.password || 'demo123'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* FORGOT PASSWORD VIEW (RF-004) */
            <div className="animate-in fade-in">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => setIsForgotPassword(false)}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold mb-2 inline-flex items-center gap-1 cursor-pointer"
                >
                  ← Volver a inicio de sesión
                </button>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recuperar Contraseña</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Ingrese su correo electrónico corporativo registrado para recibir el enlace de restablecimiento.
                </p>
              </div>

              {recoverySuccess ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Solicitud Enviada con Éxito</span>
                  </div>
                  <p>{recoverySuccess}</p>
                </div>
              ) : (
                <form onSubmit={handleRecoverySubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo Electrónico Registrado
                    </label>
                    <input
                      type="email"
                      required
                      value={recoveryEmail}
                      onChange={e => setRecoveryEmail(e.target.value)}
                      placeholder="admin@makersolutions.sv, carlos.rivas@makersolutions.sv"
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800"
                    />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <p className="font-semibold text-slate-800 mb-1">Correos de prueba disponibles:</p>
                    <div className="space-y-0.5 text-[11px] text-slate-500">
                      <div>• admin@makersolutions.sv</div>
                      <div>• carlos.rivas@makersolutions.sv</div>
                      <div>• gabriela.carranza@makersolutions.sv</div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KeyRound className="h-4 w-4" />
                    <span>Enviar Enlace de Recuperación</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
