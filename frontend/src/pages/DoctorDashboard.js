import React, { useEffect, useState, useContext } from 'react';
import SectionCard from '../components/SectionCard';
import { FiCalendar, FiClock, FiUser, FiFileText, FiCheck, FiX, FiEdit } from 'react-icons/fi';
import api from '../utils/api';
import { AuthContext } from '../context/AuthContext';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const { currentUser } = useContext(AuthContext);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recordForm, setRecordForm] = useState(null); // id of appointment to add record
  const [form, setForm] = useState({ diagnosis: '', prescription: '' });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = () => {
    api.getDoctorAppointments()
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Не удалось загрузить записи врача'))
      .finally(() => setLoading(false));
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Отменить эту запись?')) return;
    try {
      await api.cancelAppointment(id);
      setAppointments(appointments.filter(a => a.id !== id));
    } catch (err) {
      alert('Ошибка: ' + err.message);
    }
  };

  const handleAddRecord = async (e, appt) => {
    e.preventDefault();
    try {
      await api.addMedicalRecord({
        userId: String(appt.userId),
        doctorName: currentUser.username,
        specialty: currentUser.specialty,
        diagnosis: form.diagnosis,
        prescription: form.prescription,
        status: 'completed'
      });
      alert('Запись добавлена в медкарту пациента!');
      setRecordForm(null);
      setForm({ diagnosis: '', prescription: '' });
      // Можно было бы обновить статус записи
    } catch (err) {
      alert('Ошибка при добавлении: ' + err.message);
    }
  };

  return (
    <div className="doctor-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Кабинет врача</h1>
          <p>Управление расписанием и пациентами</p>
        </div>
      </div>

      <div className="doctor-stats-grid">
        <div className="doctor-stat glass-panel">
          <FiCalendar size={24} color="var(--primary)" />
          <div>
            <span>{appointments.length}</span>
            <p>Записей всего</p>
          </div>
        </div>
        <div className="doctor-stat glass-panel">
          <FiClock size={24} color="var(--accent-orange)" />
          <div>
            <span>{appointments.filter((a) => a.status === 'planned').length}</span>
            <p>Ожидают приёма</p>
          </div>
        </div>
        <div className="doctor-stat glass-panel">
          <FiFileText size={24} color="var(--accent-green)" />
          <div>
            <span>{new Set(appointments.map((a) => a.userId)).size}</span>
            <p>Пациентов</p>
          </div>
        </div>
      </div>

      <div className="doctor-content">
        <SectionCard title="Мои приёмы" className="glass-panel">
          {loading && <p className="doctor-state">Загружаем записи...</p>}
          {error && <p className="doctor-error">{error}</p>}
          {!loading && appointments.length === 0 && (
            <p className="doctor-state">Пока никто не записался к вам на приём.</p>
          )}
          
          <div className="doctor-appointment-list">
            {appointments.map((item) => (
              <div className="doctor-appointment glass-panel" key={item.id}>
                <div className="doctor-appointment-header">
                  <div className="doctor-appointment-date">
                    <strong>{item.date}</strong>
                    <span>{item.time}</span>
                  </div>
                  <span className={`badge ${item.status === 'planned' ? 'badge-primary' : 'badge-success'}`}>
                    {item.status === 'planned' ? 'Запланирован' : 'Завершён'}
                  </span>
                </div>
                
                <div className="doctor-appointment-body">
                  <h3>{item.reason}</h3>
                  <p><FiUser size={14} /> Ребёнок: <strong>{item.childName || 'Не указан'}</strong></p>
                  <p><FiFileText size={14} /> ID родителя: {item.userId}</p>
                  {item.note && <p className="appt-note"><i>"{item.note}"</i></p>}
                </div>
                
                <div className="doctor-actions">
                  <button className="btn-icon danger" onClick={() => handleCancel(item.id)} title="Отменить">
                    <FiX /> Отменить
                  </button>
                  <button className="btn-icon primary" onClick={() => setRecordForm(item.id)} title="Выписать рецепт/диагноз">
                    <FiEdit /> Заключение
                  </button>
                </div>

                {recordForm === item.id && (
                  <form className="doctor-record-form slide-down" onSubmit={(e) => handleAddRecord(e, item)}>
                    <h4>Медицинское заключение</h4>
                    <input 
                      placeholder="Диагноз / Результат осмотра" 
                      value={form.diagnosis} 
                      onChange={e => setForm({...form, diagnosis: e.target.value})} 
                      required 
                    />
                    <textarea 
                      placeholder="Назначения, рецепт, рекомендации..." 
                      rows={3} 
                      value={form.prescription} 
                      onChange={e => setForm({...form, prescription: e.target.value})} 
                      required 
                    />
                    <div className="form-actions">
                      <button type="submit" className="btn-primary">Сохранить в карту</button>
                      <button type="button" className="btn-outline" onClick={() => setRecordForm(null)}>Отмена</button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export default DoctorDashboard;
