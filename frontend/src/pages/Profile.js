import React, { useContext, useEffect, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiCreditCard, FiPlus, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Profile.css';

const FALLBACK_DEVELOPMENT_STATUSES = ['ЗРР', 'ЗПР', 'РАС', 'СДВГ', 'Норма развития', 'Наблюдение'];

function validateIIN(iin) {
  if (!/^\d{12}$/.test(iin)) return { valid: false, msg: 'ИИН должен содержать 12 цифр' };
  const cg = parseInt(iin[6], 10);
  if (cg < 1 || cg > 6) return { valid: false, msg: 'Некорректный код века и пола' };
  const mm = parseInt(iin.slice(2, 4), 10);
  const dd = parseInt(iin.slice(4, 6), 10);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return { valid: false, msg: 'Некорректная дата рождения' };

  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let sum = w1.reduce((acc, w, i) => acc + w * parseInt(iin[i], 10), 0);
  let rem = sum % 11;
  if (rem === 10) {
    const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    sum = w2.reduce((acc, w, i) => acc + w * parseInt(iin[i], 10), 0);
    rem = sum % 11;
  }
  if (rem !== parseInt(iin[11], 10)) return { valid: false, msg: 'Контрольная цифра не совпадает' };
  return { valid: true, msg: 'ИИН прошёл проверку' };
}

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    iin: '',
    birthDate: '',
    developmentStatus: 'Наблюдение',
    primaryNeed: '',
    notes: '',
  });
  const [iinState, setIinState] = useState(null);
  const [catalog, setCatalog] = useState({ developmentStatuses: FALLBACK_DEVELOPMENT_STATUSES });

  const loadChildren = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getChildren();
      setChildren(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Не удалось загрузить детей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
    api.getCatalog()
      .then((data) => setCatalog({
        developmentStatuses: Array.isArray(data?.developmentStatuses) ? data.developmentStatuses : FALLBACK_DEVELOPMENT_STATUSES,
      }))
      .catch(() => {});
  }, []);

  const updateIIN = (value) => {
    const clean = value.replace(/\D/g, '').slice(0, 12);
    setForm((prev) => ({ ...prev, iin: clean }));
    setIinState(clean.length === 12 ? validateIIN(clean) : null);
  };

  const addChild = async (event) => {
    event.preventDefault();
    if (!iinState?.valid) {
      setError('Введите корректный ИИН ребёнка');
      return;
    }
    try {
      const child = await api.addChild(form);
      setChildren([...children, child]);
      setForm({ name: '', iin: '', birthDate: '', developmentStatus: 'Наблюдение', primaryNeed: '', notes: '' });
      setIinState(null);
      setShowForm(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Не удалось прикрепить ребёнка');
    }
  };

  const name = currentUser?.username || 'Пользователь';
  const role = currentUser?.role === 'doctor' ? 'Врач' : currentUser?.role === 'parent' ? 'Родитель / представитель' : 'Пациент';
  const initial = name.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <section className="profile-overview">
        <div className="profile-avatar">{initial}</div>
        <div>
          <span className="eyebrow">Профиль</span>
          <h1>{name}</h1>
          <p>{role}</p>
          <div className="profile-tags">
            <span>{currentUser?.email}</span>
            {currentUser?.iin && <span>ИИН: {currentUser.iin}</span>}
          </div>
        </div>
      </section>

      {error && <div className="profile-error"><FiAlertTriangle /> {error}</div>}

      <section className="profile-card">
        <div className="profile-card-title">
          <div>
            <h2>Семейные профили</h2>
            <p>Прикрепите ребёнка по ИИН РК, чтобы вести медкарту и упражнения.</p>
          </div>
          <button className="btn-outline" onClick={() => setShowForm((value) => !value)}>
            <FiPlus /> Добавить ребёнка
          </button>
        </div>

        {showForm && (
          <form className="child-form" onSubmit={addChild}>
            <div className="form-row">
              <div className="form-group">
                <label>ФИО ребёнка</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Дата рождения</label>
                <input type="date" className="form-input" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Категория наблюдения</label>
                <select className="form-input" value={form.developmentStatus} onChange={(e) => setForm({ ...form, developmentStatus: e.target.value })}>
                  {catalog.developmentStatuses.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Основной запрос</label>
                <input
                  className="form-input"
                  placeholder="Например: речь, внимание, поведение"
                  value={form.primaryNeed}
                  onChange={(e) => setForm({ ...form, primaryNeed: e.target.value })}
                />
              </div>
            </div>
            <div className="form-group">
              <label>ИИН ребёнка</label>
              <div className="iin-input-row">
                <FiCreditCard />
                <input className={`form-input ${iinState && !iinState.valid ? 'error' : ''}`} value={form.iin} onChange={(e) => updateIIN(e.target.value)} maxLength={12} required />
              </div>
              {iinState && <div className={`iin-message ${iinState.valid ? 'valid' : 'invalid'}`}>{iinState.msg}</div>}
            </div>
            <div className="form-group">
              <label>Короткая заметка</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Что важно знать специалисту перед первым приёмом"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="form-actions">
              <button className="btn-primary" type="submit">Прикрепить</button>
              <button className="btn-ghost" type="button" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        )}

        {loading && <div className="profile-state">Загружаем семейные профили...</div>}
        {!loading && children.length === 0 && (
          <div className="profile-state">Пока нет прикреплённых детей.</div>
        )}
        <div className="children-grid">
          {children.map((child) => {
            const check = validateIIN(child.iin || '');
            return (
              <article className="child-profile-card" key={child.id}>
                <div className="child-profile-icon"><FiUser /></div>
                <div>
                  <h3>{child.name}</h3>
                  <p>{child.birthDate || 'Дата рождения не указана'}</p>
                  {child.developmentStatus && <span className="child-badge">{child.developmentStatus}</span>}
                  {child.primaryNeed && <p>{child.primaryNeed}</p>}
                  <small className={check.valid ? 'valid' : 'invalid'}>
                    <FiCheckCircle /> {check.valid ? 'ИИН подтверждён' : 'Проверьте ИИН'}
                  </small>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Profile;
