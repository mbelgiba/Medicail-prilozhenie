import React, { useContext, useEffect, useMemo, useState } from 'react';
import { FiAlertTriangle, FiCheckCircle, FiClipboard, FiFileText, FiPlus, FiShield, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Medical.css';

function Medical() {
  const { currentUser } = useContext(AuthContext);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    doctorName: '',
    specialty: '',
    diagnosis: '',
    prescription: '',
    status: 'completed',
  });

  useEffect(() => {
    let mounted = true;
    api.getMedicalRecords()
      .then((data) => {
        if (mounted) setRecords(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || 'Не удалось загрузить медкарту');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const history = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.visitDate || b.createdAt || 0) - new Date(a.visitDate || a.createdAt || 0));
  }, [records]);

  const addRecord = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const created = await api.addMedicalRecord(form);
      setRecords([created, ...records]);
      setForm({ doctorName: '', specialty: '', diagnosis: '', prescription: '', status: 'completed' });
    } catch (err) {
      setError(err.message || 'Не удалось добавить запись');
    }
  };

  const updateField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const name = currentUser?.username || 'Пользователь';

  return (
    <div className="medical-page">
      <section className="medical-header">
        <div>
          <span className="eyebrow">Медицинская карта</span>
          <h1>{name}</h1>
          <p>Храните визиты, заключения и назначения в одном месте. Данные доступны только после входа в аккаунт.</p>
        </div>
        <div className="medical-header-stat">
          <FiFileText />
          <strong>{records.length}</strong>
          <span>записей в карте</span>
        </div>
      </section>

      <div className="medical-grid">
        <section className="medical-card">
          <div className="medical-card-title">
            <div>
              <h2>История визитов</h2>
              <p>Фактические записи, сохранённые через backend</p>
            </div>
          </div>

          {loading && <div className="medical-state">Загружаем медкарту...</div>}
          {error && <div className="medical-warning"><FiAlertTriangle /> {error}</div>}
          {!loading && history.length === 0 && (
            <div className="medical-state">Записей пока нет. Добавьте первый визит, анализ или заключение.</div>
          )}

          <div className="medical-timeline">
            {history.map((record) => (
              <article className="medical-record" key={record.id}>
                <div className="medical-record-icon"><FiClipboard /></div>
                <div>
                  <div className="record-meta">
                    <span>{record.visitDate ? new Date(record.visitDate).toLocaleDateString('ru-RU') : 'Сегодня'}</span>
                    <span>{record.status || 'completed'}</span>
                  </div>
                  <h3>{record.diagnosis || 'Медицинская запись'}</h3>
                  <p>{record.prescription || 'Назначения не указаны'}</p>
                  <small><FiUser /> {record.doctorName || 'Врач'} · {record.specialty || 'Специалист'}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="medical-side">
          <section className="medical-card">
            <div className="medical-card-title">
              <div>
                <h2>Добавить запись</h2>
                <p>После визита или консультации</p>
              </div>
            </div>
            <form className="medical-form" onSubmit={addRecord}>
              <div className="form-group">
                <label>Врач или клиника</label>
                <input className="form-input" value={form.doctorName} onChange={(e) => updateField('doctorName', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Специальность</label>
                <input className="form-input" value={form.specialty} onChange={(e) => updateField('specialty', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Диагноз / событие</label>
                <input className="form-input" value={form.diagnosis} onChange={(e) => updateField('diagnosis', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Назначения / заметки</label>
                <textarea className="form-input" rows={4} value={form.prescription} onChange={(e) => updateField('prescription', e.target.value)} required />
              </div>
              <button className="btn-primary" type="submit"><FiPlus /> Сохранить</button>
            </form>
          </section>

          <section className="medical-card">
            <div className="medical-card-title">
              <div>
                <h2>Безопасность</h2>
                <p>Что важно помнить</p>
              </div>
            </div>
            <div className="safety-list">
              <div><FiShield /> Не вводите чужие медицинские данные без согласия законного представителя.</div>
              <div><FiCheckCircle /> Назначения должен подтверждать врач или профильный специалист.</div>
              <div><FiAlertTriangle /> При резком ухудшении состояния звоните 103 или 112.</div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Medical;
