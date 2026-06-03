import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard';
import { FiCalendar, FiClock, FiUser, FiFileText } from 'react-icons/fi';
import api from '../utils/api';
import './DoctorDashboard.css';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getDoctorAppointments()
      .then((data) => setAppointments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || 'Не удалось загрузить записи врача'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="doctor-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Кабинет врача</h1>
          <p>Родители и дети, записанные на ваши приёмы</p>
        </div>
      </div>

      <div className="doctor-stats-grid">
        <div className="doctor-stat"><FiCalendar /><span>{appointments.length}</span><p>Записей всего</p></div>
        <div className="doctor-stat"><FiClock /><span>{appointments.filter((a) => a.status === 'planned').length}</span><p>Ожидают приёма</p></div>
        <div className="doctor-stat"><FiFileText /><span>{new Set(appointments.map((a) => a.userId)).size}</span><p>Пациентов</p></div>
      </div>

      <SectionCard title="Мои приёмы">
        {loading && <p className="doctor-state">Загружаем записи...</p>}
        {error && <p className="doctor-error">{error}</p>}
        {!loading && appointments.length === 0 && (
          <p className="doctor-state">Пока никто не записался к вам на приём.</p>
        )}
        <div className="doctor-appointment-list">
          {appointments.map((item) => (
            <div className="doctor-appointment" key={item.id}>
              <div className="doctor-appointment-date">
                <strong>{item.date}</strong>
                <span>{item.time}</span>
              </div>
              <div className="doctor-appointment-body">
                <h3>{item.reason}</h3>
                <p><FiUser size={13} /> Пациент/родитель ID: {item.userId}</p>
                {item.note && <p><FiFileText size={13} /> {item.note}</p>}
              </div>
              <span className="doctor-status">{item.status}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export default DoctorDashboard;
