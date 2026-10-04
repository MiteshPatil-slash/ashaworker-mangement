import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Heart,
  User,
  Lock,
  ArrowRight,
  Sparkles,
  Globe,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedInUser = await login(username, password);
      if (loggedInUser.role === 'ADMIN') navigate('/admin');
      else if (loggedInUser.role === 'SUPERVISOR') navigate('/supervisor');
      else navigate('/');
    } catch (err) {
      setError(err.message || t('loginPage.loginFailed', 'Login failed. Check your username and password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === 'ASHA_WORKER') {
      setUsername('asha_sunita');
      setPassword('Asha@123');
    } else if (roleKey === 'SUPERVISOR') {
      setUsername('supervisor');
      setPassword('Super@123');
    } else if (roleKey === 'ADMIN') {
      setUsername('admin');
      setPassword('Admin@123');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        <div className="md:col-span-5 bg-gradient-to-b from-blue-900 via-indigo-900 to-[#0e1e38] text-white p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/30 backdrop-blur-md border border-blue-400/40 flex items-center justify-center text-white">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">{t('appName', 'ASHA SAATHI')}</h1>
                <p className="text-[10px] text-blue-200 uppercase tracking-wider font-semibold">
                  {t('layout.nationalHealthMission', 'National Health Mission')}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-blue-100 font-medium leading-relaxed">
              {t('loginPage.intro', 'Empowering frontline community health workers with smart digital healthcare tools.')}
            </p>
          </div>

          <div className="my-6 relative z-10 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-tr from-blue-600/40 to-indigo-500/30 p-2 border border-blue-400/30 backdrop-blur-sm flex items-center justify-center shadow-inner group">
              <img
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&auto=format&fit=crop&q=80"
                alt="Community Health Worker"
                className="w-full h-full object-cover rounded-xl brightness-95"
              />
              <div className="absolute bottom-2 inset-x-2 bg-slate-900/80 backdrop-blur-md rounded-lg p-2 text-center border border-white/10">
                <div className="text-xs font-bold text-amber-300">
                  {t('loginPage.brandTag', 'SAATHI')}
                </div>
                <div className="text-[10px] text-slate-200 font-medium">
                  {t('loginPage.familyHealth', 'Better Health For Every Family')}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="font-semibold">
                {t('loginPage.slogan', 'Healthy Communities | Stronger Tomorrow')}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto mb-3 shadow-xs">
                <Heart className="w-6 h-6 fill-blue-600 text-blue-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">{t('appName', 'ASHA SAATHI')}</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {t('loginPage.slogan', 'Healthy Communities | Stronger Tomorrow')}
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">
                {t('loginPage.selectRole', 'Select Your Role')}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'ASHA_WORKER', label: t('loginPage.worker', 'ASHA Worker'), sub: t('loginPage.field', 'Field') },
                  { key: 'SUPERVISOR', label: t('loginPage.supervisor', 'Supervisor'), sub: t('loginPage.monitor', 'Monitor') },
                  { key: 'ADMIN', label: t('loginPage.admin', 'Admin'), sub: t('loginPage.manage', 'Manage') }
                ].map(r => (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => handleQuickRoleSelect(r.key)}
                    className={`p-2.5 rounded-xl text-center border text-xs transition-all cursor-pointer ${
                      selectedRole === r.key
                        ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-bold shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-slate-50/50'
                    }`}
                  >
                    <div className="font-bold">{r.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{r.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold px-3 py-2.5 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('loginPage.username', 'Username')}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t('loginPage.usernamePlaceholder', 'Enter username')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('loginPage.password', 'Password')}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('loginPage.passwordPlaceholder', 'Enter password')}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer p-0.5 rounded-md hover:bg-slate-200/50 transition-colors"
                    aria-label={showPassword ? t('loginPage.hidePassword', 'Hide password') : t('loginPage.showPassword', 'Show password')}
                    title={showPassword ? t('loginPage.hidePassword', 'Hide password') : t('loginPage.showPassword', 'Show password')}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? t('loginPage.loggingIn', 'Logging in...') : t('loginPage.login', 'Login')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-center gap-2">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1 mr-2">
              <Globe className="w-3.5 h-3.5" /> {t('loginPage.language', 'Language')}:
            </span>
            <button type="button" aria-pressed={language === 'en'} onClick={() => setLanguage('en')} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${language === 'en' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>English</button>
            <button type="button" aria-pressed={language === 'mr'} onClick={() => setLanguage('mr')} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${language === 'mr' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>मराठी</button>
            <button type="button" aria-pressed={language === 'hi'} onClick={() => setLanguage('hi')} className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${language === 'hi' ? 'bg-blue-100 text-blue-800 font-bold' : 'text-slate-600 hover:bg-slate-100'}`}>हिंदी</button>
          </div>
        </div>
      </div>
    </div>
  );
}