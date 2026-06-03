import React, { useContext, useEffect, useMemo, useState } from 'react';
import SectionCard from '../components/SectionCard';
import { FiAlertTriangle, FiClock, FiPlus, FiUser } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import api from '../utils/api';
import './Medical.css';

function Medical() {
  const { currentUser } = useContext(AuthContext);
  const name = currentUser?.username || 'Пользователь';
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recordForm, setRecordForm] = useState({
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
        if (mounted) setError(err.message || 'Не удалось загрузить записи');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const apiHistory = useMemo(() => records.map((record) => ({
    id: `api-${record.id}`,
    type: 'visit',
    date: new Date(record.visitDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }),
    title: record.diagnosis || record.specialty || 'Медицинская запись',
    desc: record.prescription || 'Назначения не указаны',
    doctor: `${record.doctorName || 'Врач'} · ${record.specialty || 'Специалист'}`,
  })), [records]);

  const history = apiHistory;

  const handleAddRecord = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const record = await api.addMedicalRecord(recordForm);
      setRecords([record, ...records]);
      setRecordForm({ doctorName: '', specialty: '', diagnosis: '', prescription: '', status: 'completed' });
    } catch (err) {
      setError(err.message || 'Не удалось добавить запись');
    }
  };

  const reminders = [
    { title: 'Витамин D', time: '09:00', details: '1 капля после завтрака' },
    { title: 'Питьевой режим', time: 'В течение дня', details: 'Вода маленькими порциями' },
    { title: 'Контроль температуры', time: '20:00', details: 'Записать показатель в заметки' },
  ];

  return (
    <div className="medical-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Медицинская карта</h1>
          <p>История болезни и физические параметры: {name}</p>
        </div>
      </div>

      <div className="app-layout-grid">
        
        {/* Left: Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <SectionCard title="История визитов и анализов">
            {loading && <div className="medical-state">Загружаем данные медкарты...</div>}
            {error && <div className="medical-warning"><FiAlertTriangle /> {error}</div>}
            {!loading && history.length === 0 ? (
              <div className="medical-state">Записей пока нет. Добавьте первый визит или анализ.</div>
            ) : (
              <div className="timeline-container">
                {history.map(item => (
                  <div key={item.id} className="timeline-item animate-fadeInUp">
                    <div className={`timeline-dot ${item.type}`}></div>
                    <div className="timeline-date">{item.date}</div>
                    <div className="timeline-content">
                      <h4>{item.title}</h4>
                      <p>{item.desc}</p>
                      <div className="t-doctor"><FiUser size={12}/> {item.doctor}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Добавить запись">
            <form className="medical-record-form" onSubmit={handleAddRecord}>
              <div className="form-row">
                <div className="form-group">
                  <label>Врач / клиника</label>
                  <input className="form-input" value={recordForm.doctorName} onChange={(e) => setRecordForm({ ...recordForm, doctorName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Специальность</label>
                  <input className="form-input" value={recordForm.specialty} onChange={(e) => setRecordForm({ ...recordForm, specialty: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Диагноз / событие</label>
                <input className="form-input" value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Назначения / заметки</label>
                <textarea className="form-input" rows={3} value={recordForm.prescription} onChange={(e) => setRecordForm({ ...recordForm, prescription: e.target.value })} required />
              </div>
              <button className="btn-primary" type="submit">Сохранить в медкарту</button>
            </form>
          </SectionCard>
        </div>

        {/* Right: Parameters & Allergies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <SectionCard title="Физические параметры">
            <div className="params-grid">
              <div className="param-card">
                <div className="param-icon">⚖️</div>
                <div className="param-val">22 кг</div>
                <div className="param-label">Вес</div>
              </div>
              <div className="param-card">
                <div className="param-icon">📏</div>
                <div className="param-val">115 см</div>
                <div className="param-label">Рост</div>
              </div>
              <div className="param-card">
                <div className="param-icon">🩸</div>
                <div className="param-val">II (A)</div>
                <div className="param-label">Группа крови</div>
              </div>
              <div className="param-card">
                <div className="param-icon">💓</div>
                <div className="param-val">85</div>
                <div className="param-label">Пульс (уд/мин)</div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Аллергии и противопоказания">
            <div style={{ background: 'var(--accent-red-bg)', border: '1px solid rgba(239,68,68,0.2)', padding: '16px', borderRadius: 'var(--radius)', color: 'var(--accent-red)' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>⚠️ Пищевая аллергия</div>
              <p style={{ fontSize: '13px' }}>Цитрусовые, мед, шоколад (умеренно).</p>
            </div>
            <div style={{ background: 'var(--primary-light)', border: '1px solid rgba(27,110,243,0.2)', padding: '16px', borderRadius: 'var(--radius)', color: 'var(--primary)', marginTop: '12px' }}>
              <div style={{ fontWeight: 700, marginBottom: '4px', fontSize: '14px' }}>Медикаментозных аллергий нет</div>
              <p style={{ fontSize: '13px' }}>Пенициллин и антибиотики переносятся нормально.</p>
            </div>
          </SectionCard>

          <SectionCard title="Лекарства и напоминания">
            <div className="reminder-list">
              {reminders.map((item) => (
                <div key={item.title} className="reminder-item">
                  <div className="reminder-time"><FiClock /> {item.time}</div>
                  <div>
                    <h4>{item.title}</h4>
                    <p>{item.details}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-outline add-reminder-btn">
              <FiPlus size={14} /> Добавить напоминание
            </button>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}

export default Medical;
