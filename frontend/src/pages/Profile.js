import React, { useState, useRef, useContext } from 'react';
import SectionCard from '../components/SectionCard';
import { FiPlus, FiUser, FiUpload, FiDownload, FiFileText, FiImage } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

// ─── Kazakhstan IIN Validator (same algorithm as Login.js) ──────────────────
function validateIIN(iin) {
  if (!/^\d{12}$/.test(iin)) return { valid: false, msg: 'ИИН должен содержать ровно 12 цифр' };
  const cg = parseInt(iin[6]);
  if (cg < 1 || cg > 6) return { valid: false, msg: 'Некорректный 7-й разряд ИИН (должен быть 1–6)' };
  const mm = parseInt(iin.slice(2, 4));
  const dd = parseInt(iin.slice(4, 6));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return { valid: false, msg: 'Некорректная дата рождения в ИИН' };

  const w1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  let sum = w1.reduce((acc, w, i) => acc + w * parseInt(iin[i]), 0);
  let rem = sum % 11;
  if (rem === 10) {
    const w2 = [3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2];
    sum = w2.reduce((acc, w, i) => acc + w * parseInt(iin[i]), 0);
    rem = sum % 11;
  }
  if (rem !== parseInt(iin[11])) return { valid: false, msg: 'Контрольная цифра ИИН не совпадает' };

  const gender = cg % 2 === 1 ? 'Мужской' : 'Женский';
  const century = [1, 2].includes(cg) ? '1800-х' : [3, 4].includes(cg) ? '1900-х' : '2000-х';
  return { valid: true, msg: `✓ ИИН корректен · Пол: ${gender} · Рождён в ${century}` };
}

function Profile() {
  const { currentUser } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [children, setChildren] = useState([
    { id: 1, name: 'Алиса Иванова', iin: '160515450123', birthDate: '15.05.2016', active: true }
  ]);

  const [documents, setDocuments] = useState([
    { id: 1, name: 'Общий_анализ_крови_Май.pdf', date: '10 Мая 2026', size: '1.2 MB', type: 'pdf' },
    { id: 2, name: 'Справка_в_бассейн.jpg',      date: '01 Апр 2026', size: '2.5 MB', type: 'img' },
  ]);

  // New child form state
  const [childForm, setChildForm] = useState({ name: '', iin: '', birthDate: '' });
  const [childIINState, setChildIINState] = useState(null);

  // Form fields
  const [phone, setPhone] = useState(currentUser?.phone || '+7 (701) 123-45-67');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [saveMsg, setSaveMsg] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    const type = ['pdf'].includes(ext) ? 'pdf' : 'img';
    const newDoc = {
      id: Date.now(),
      name: file.name,
      date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
      size: (file.size / 1024 / 1024).toFixed(1) + ' MB',
      type,
    };
    setDocuments([newDoc, ...documents]);
  };

  const handleExport = (doc) => {
    alert(`📥 Скачивание файла: ${doc.name}`);
  };

  const handleChildIINChange = (val) => {
    const clean = val.replace(/\D/g, '').slice(0, 12);
    setChildForm((f) => ({ ...f, iin: clean }));
    setChildIINState(clean.length === 12 ? validateIIN(clean) : null);
  };

  const handleAddChild = (e) => {
    e.preventDefault();
    if (!childIINState?.valid) {
      alert('Введите корректный ИИН РК для ребёнка');
      return;
    }
    setChildren([...children, {
      id: Date.now(),
      name: childForm.name,
      iin: childForm.iin,
      birthDate: childForm.birthDate,
      active: false,
    }]);
    setChildForm({ name: '', iin: '', birthDate: '' });
    setChildIINState(null);
    setShowAddForm(false);
  };

  const handleSaveProfile = () => {
    setSaveMsg('✓ Изменения сохранены');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  const initial = currentUser?.username?.charAt(0)?.toUpperCase() || 'А';
  const name = currentUser?.username || 'Пользователь';
  const role = currentUser?.role === 'parent' ? 'Родитель / Представитель' :
               currentUser?.role === 'doctor' ? 'Врач' : 'Пациент';

  return (
    <div className="profile-page">
      <h1 className="profile-page-title">Настройки профиля</h1>

      {/* ── Parent Profile ── */}
      <SectionCard>
        <div className="profile-header-info">
          <div className="profile-avatar">{initial}</div>
          <div className="profile-name">
            <h2>{name}</h2>
            <p>
              <span>{role}</span>
              {currentUser?.iin && (
                <span className="profile-iin-tag">ИИН: {currentUser.iin}</span>
              )}
            </p>
          </div>
        </div>

        <div className="profile-form-section">
          <div className="form-row">
            <div className="form-group">
              <label>Телефон</label>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button className="btn-primary" onClick={handleSaveProfile}>
              Сохранить изменения
            </button>
            {saveMsg && (
              <span style={{ color: 'var(--accent-green)', fontSize: '13px', fontWeight: 600 }}>
                {saveMsg}
              </span>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ── Documents ── */}
      <SectionCard
        title="Медицинские документы (Анализы, Справки)"
        noPadding
        actionElement={
          <>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <button
              className="btn-outline"
              onClick={() => fileInputRef.current.click()}
            >
              <FiUpload size={14} /> Загрузить
            </button>
          </>
        }
      >
        {documents.map((doc) => (
          <div className="document-item" key={doc.id}>
            <div className="doc-info">
              <div className={`doc-icon ${doc.type}`}>
                {doc.type === 'pdf' ? <FiFileText /> : <FiImage />}
              </div>
              <div className="doc-details">
                <h4>{doc.name}</h4>
                <p>{doc.date} · {doc.size}</p>
              </div>
            </div>
            <button className="btn-export" onClick={() => handleExport(doc)}>
              <FiDownload size={13} /> Скачать
            </button>
          </div>
        ))}
      </SectionCard>

      {/* ── Children ── */}
      <SectionCard
        title="Моя семья (Прикреплённые дети)"
        actionElement={
          <button
            className="btn-outline"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <FiPlus size={14} /> Добавить ребёнка
          </button>
        }
      >
        <div className="children-list">
          {children.map((child) => {
            const iinCheck = validateIIN(child.iin);
            return (
              <div key={child.id} className={`child-card ${child.active ? 'active' : ''}`}>
                <div className="child-info-main">
                  <div className="child-avatar">{child.name.charAt(0)}</div>
                  <div className="child-details">
                    <h4>{child.name}</h4>
                    <p>ИИН: {child.iin} · {child.birthDate}</p>
                    <p className={iinCheck.valid ? 'child-iin-valid' : 'child-iin-invalid'}>
                      {iinCheck.valid ? '✓ ИИН подтверждён' : '✗ Проверьте ИИН'}
                    </p>
                  </div>
                </div>
                <button className={`btn-switch-profile ${child.active ? 'current' : ''}`}>
                  {child.active ? '✓ Текущий профиль' : 'Переключиться'}
                </button>
              </div>
            );
          })}
        </div>

        {showAddForm && (
          <form className="add-child-form" onSubmit={handleAddChild}>
            <h3>Прикрепление ребёнка по ИИН РК</h3>
            <div className="form-row">
              <div className="form-group">
                <label>ФИО ребёнка</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Иванова Алиса"
                  value={childForm.name}
                  onChange={(e) => setChildForm({ ...childForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>ИИН РК (12 цифр)</label>
                <input
                  type="text"
                  className={`form-input ${childIINState ? (childIINState.valid ? '' : 'error') : ''}`}
                  placeholder="000000000000"
                  value={childForm.iin}
                  onChange={(e) => handleChildIINChange(e.target.value)}
                  maxLength={12}
                  required
                />
                {childIINState && (
                  <div className={`iin-status ${childIINState.valid ? 'valid' : 'invalid'}`}>
                    {childIINState.msg}
                  </div>
                )}
                {!childIINState && (
                  <div className="iin-status hint">
                    💡 Введите 12-значный ИИН — система проверит контрольный разряд автоматически
                  </div>
                )}
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Дата рождения</label>
                <input
                  type="date"
                  className="form-input"
                  value={childForm.birthDate}
                  onChange={(e) => setChildForm({ ...childForm, birthDate: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Пол (из ИИН)</label>
                <input
                  type="text"
                  className="form-input"
                  readOnly
                  value={
                    childIINState?.valid
                      ? (parseInt(childForm.iin[6]) % 2 === 1 ? 'Мужской' : 'Женский')
                      : 'Определится из ИИН'
                  }
                  style={{ background: 'var(--bg-main)', color: 'var(--text-muted)' }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              <button type="submit" className="btn-primary">Прикрепить профиль</button>
              <button type="button" className="btn-outline" onClick={() => { setShowAddForm(false); setChildIINState(null); }}>
                Отмена
              </button>
            </div>
          </form>
        )}
      </SectionCard>
    </div>
  );
}

export default Profile;