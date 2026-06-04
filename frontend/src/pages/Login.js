import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiCalendar, FiCreditCard, FiEye, FiEyeOff, FiFileText, FiLock, FiMail, FiMapPin, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

// ─── Kazakhstan IIN Validator ───────────────────────────────────────────────
function validateIIN(iin) {
  if (!/^\d{12}$/.test(iin)) return { valid: false, msg: 'ИИН должен содержать ровно 12 цифр' };

  // Digit 7 (index 6): century+gender, valid values 1-6
  const centuryGender = parseInt(iin[6]);
  if (centuryGender < 1 || centuryGender > 6) {
    return { valid: false, msg: 'Некорректный 7-й разряд ИИН (должен быть 1–6)' };
  }

  // Validate birth date embedded in first 6 digits
  const yy = parseInt(iin.slice(0, 2));
  const mm = parseInt(iin.slice(2, 4));
  const dd = parseInt(iin.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return { valid: false, msg: 'Некорректная дата рождения в ИИН' };
  }

  // Check digit algorithm (weights1, then weights2 if remainder=10)
  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let sum = w1.reduce((acc, w, i) => acc + w * parseInt(iin[i]), 0);
  let rem = sum % 11;

  if (rem === 10) {
    const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    sum = w2.reduce((acc, w, i) => acc + w * parseInt(iin[i]), 0);
    rem = sum % 11;
  }

  if (rem !== parseInt(iin[11])) {
    return { valid: false, msg: 'Контрольная цифра ИИН не совпадает' };
  }

  // Determine gender from century-gender digit
  const gender = centuryGender % 2 === 1 ? 'Мужской' : 'Женский';
  const centuryMap = { 1: '1800–1899', 2: '1800–1899', 3: '1900–1999', 4: '1900–1999', 5: '2000–2099', 6: '2000–2099' };
  return { valid: true, msg: `✓ ИИН корректен · Пол: ${gender} · Период: ${centuryMap[centuryGender]}` };
}

// ─── Features list ───────────────────────────────────────────────────────────
const features = [
  { icon: <FiFileText />, title: 'Семейные медкарты', desc: 'Визиты, диагнозы и назначения в одном месте' },
  { icon: <FiCalendar />, title: 'Запись к специалистам', desc: 'Педиатр, логопед, невролог и психолог' },
  { icon: <FiActivity />, title: 'Упражнения развития', desc: 'Речь, внимание и бытовые навыки после консультации' },
  { icon: <FiMapPin />, title: 'Карта учреждений', desc: 'Поликлиники, аптеки и центры развития рядом' },
];

const DEMO_LOGIN = { email: 'test@damukids.kz', password: '123456' };
const SPECIALTIES = ['Педиатр', 'Логопед-дефектолог', 'Детский невролог', 'Детский психолог', 'Реабилитолог'];

// ─── Component ───────────────────────────────────────────────────────────────
function Login() {
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Register form
  const [regForm, setRegForm] = useState({
    username: '',
    email: '',
    password: '',
    iin: '',
    role: 'parent',
    phone: '',
    specialty: SPECIALTIES[0],
    organization: '',
  });
  const [iinState, setIinState] = useState(null); // null | { valid, msg }

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  // ── Handlers ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    const result = await login(loginForm);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setServerError(result.message || 'Неверный email или пароль');
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setServerError('');
    setLoginForm(DEMO_LOGIN);
    const result = await login(DEMO_LOGIN);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setServerError(result.message || 'Не удалось войти в демо-режим');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerError('');
    if (!iinState?.valid) {
      setServerError('Пожалуйста, введите корректный ИИН РК');
      setLoading(false);
      return;
    }
    const result = await register(regForm);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setServerError(result.message || 'Ошибка регистрации');
    }
  };

  const handleIINChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 12);
    setRegForm({ ...regForm, iin: clean });
    if (clean.length === 12) {
      setIinState(validateIIN(clean));
    } else {
      setIinState(null);
    }
  };

  return (
    <div className="login-page">

      {/* ── Left: Brand Panel ── */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">✚</div>
          <span className="login-brand-name">DamuKids</span>
        </div>

        <div className="login-hero-text">
          <h1 className="login-hero-title">
            Медицина ближе,<br />чем вы <span className="highlight">думаете</span>
          </h1>
          <p className="login-hero-desc">
            Простая семейная платформа для здоровья ребёнка: записи к специалистам, медкарта и домашние упражнения развития в одном месте.
          </p>
        </div>

        <div className="login-features">
          {features.map((f) => (
            <div key={f.title} className="login-feature-item">
              <div className="feature-icon-wrap">{f.icon}</div>
              <div className="feature-text">
                <strong>{f.title}</strong>
                <span>{f.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-form-header">
            <h2>{tab === 'login' ? 'Вход в аккаунт' : 'Регистрация'}</h2>
            <p>{tab === 'login' ? 'Введите ваши данные для входа' : 'Создайте аккаунт — это займёт минуту'}</p>
          </div>

          {/* Tabs */}
          <div className="auth-tabs">
            <button className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => { setTab('login'); setServerError(''); }}>
              Вход
            </button>
            <button className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => { setTab('register'); setServerError(''); }}>
              Регистрация
            </button>
          </div>

          {/* Server error */}
          {serverError && <div className="form-server-error" style={{ marginBottom: '16px' }}>{serverError}</div>}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form className="auth-form" onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><FiMail size={15} /></span>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@email.kz"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Пароль</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><FiLock size={15} /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Ваш пароль"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Войти в систему'}
              </button>
              <button type="button" className="btn-outline auth-submit-btn" onClick={handleDemoLogin} disabled={loading}>
                Войти в демо
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form className="auth-form" onSubmit={handleRegister}>
              <div className="form-group">
                <label>Имя (ФИО)</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><FiUser size={15} /></span>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Иванова Анна"
                    value={regForm.username}
                    onChange={(e) => setRegForm({ ...regForm, username: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><FiMail size={15} /></span>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="example@email.kz"
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>ИИН Республики Казахстан</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><FiCreditCard size={15} /></span>
                  <input
                    type="text"
                    className={`form-input ${iinState ? (iinState.valid ? '' : 'error') : ''}`}
                    placeholder="000000000000 (12 цифр)"
                    value={regForm.iin}
                    onChange={(e) => handleIINChange(e.target.value)}
                    maxLength={12}
                    required
                  />
                </div>
                {iinState && (
                  <div className={`iin-hint ${iinState.valid ? 'iin-valid' : 'iin-invalid'}`}>
                    {iinState.msg}
                  </div>
                )}
                {!iinState && (
                  <div className="iin-hint">
                    💡 ИИН — 12-значный номер гражданина РК. Проверка контрольного разряда производится автоматически.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Роль</label>
                <select
                  className="form-input"
                  value={regForm.role}
                  onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                >
                  <option value="parent">Родитель / Представитель</option>
                  <option value="doctor">Врач / Специалист</option>
                </select>
              </div>

              <div className="form-group">
                <label>Телефон</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+7..."
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                />
              </div>

              {regForm.role === 'doctor' && (
                <>
                  <div className="form-group">
                    <label>Специализация</label>
                    <select
                      className="form-input"
                      value={regForm.specialty}
                      onChange={(e) => setRegForm({ ...regForm, specialty: e.target.value })}
                    >
                      {SPECIALTIES.map((item) => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Организация / кабинет</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Например: Поликлиника №1, каб. 204"
                      value={regForm.organization}
                      onChange={(e) => setRegForm({ ...regForm, organization: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Пароль</label>
                <div className="input-icon-wrap">
                  <span className="input-icon"><FiLock size={15} /></span>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Минимум 6 символов"
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    minLength={6}
                    required
                  />
                  <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
                {loading ? <span className="spinner" /> : 'Создать аккаунт'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
