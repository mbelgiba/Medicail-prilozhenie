import React, { useState } from 'react';
import SectionCard from '../components/SectionCard';
import { FiCalendar, FiClock, FiUser, FiX, FiCheck } from 'react-icons/fi';
import './Appointments.css';

const DOCTORS = [
  { id: 1, name: 'Смирнов А.В.', spec: 'Педиатр', rating: 4.9, avatar: '👨‍⚕️' },
  { id: 2, name: 'Иванова Е.С.', spec: 'Логопед-Дефектолог', rating: 4.8, avatar: '👩‍⚕️' },
  { id: 3, name: 'Ким Д.И.',     spec: 'Детский невролог', rating: 4.7, avatar: '👨‍⚕️' },
  { id: 4, name: 'Оспанова А.К.', spec: 'Психолог', rating: 5.0, avatar: '👩‍⚕️' },
];

const SLOTS = ['09:00', '09:30', '10:00', '11:30', '14:00', '14:30', '15:00', '16:30'];

function Appointments() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [appointments, setAppointments] = useState([
    { id: 101, docName: 'Смирнов А.В.', spec: 'Педиатр', date: '2026-05-10', time: '14:30', displayDate: { day: '10', month: 'мая' } },
    { id: 102, docName: 'Иванова Е.С.', spec: 'Логопед-Дефектолог', date: '2026-05-15', time: '10:00', displayDate: { day: '15', month: 'мая' } }
  ]);

  const [successMsg, setSuccessMsg] = useState('');

  const handleBooking = () => {
    if (!selectedDoc || !selectedDate || !selectedSlot) {
      alert('Пожалуйста, выберите врача, дату и время.');
      return;
    }

    const dateObj = new Date(selectedDate);
    const months = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
    const newAppt = {
      id: Date.now(),
      docName: selectedDoc.name,
      spec: selectedDoc.spec,
      date: selectedDate,
      time: selectedSlot,
      displayDate: { day: dateObj.getDate().toString(), month: months[dateObj.getMonth()] }
    };

    setAppointments([...appointments, newAppt].sort((a, b) => new Date(a.date) - new Date(b.date)));
    setSuccessMsg(`Успешно! Вы записаны к ${selectedDoc.name} на ${selectedDate} в ${selectedSlot}`);
    setTimeout(() => setSuccessMsg(''), 4000);
    
    // Reset form
    setSelectedDoc(null);
    setSelectedDate('');
    setSelectedSlot('');
  };

  const cancelAppointment = (id) => {
    if(window.confirm('Вы уверены, что хотите отменить эту запись?')) {
      setAppointments(appointments.filter(a => a.id !== id));
    }
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <div className="page-title">
          <h1>Запись к врачу</h1>
          <p>Выберите специалиста и удобное время для визита</p>
        </div>
      </div>

      <div className="app-layout-grid">
        {/* ── Left column: Booking Form ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <SectionCard title="1. Выберите специалиста">
            <div className="doctor-grid">
              {DOCTORS.map(doc => (
                <div 
                  key={doc.id} 
                  className={`doctor-card ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="doctor-avatar">{doc.avatar}</div>
                  <div className="doctor-info">
                    <h4>{doc.name}</h4>
                    <p>{doc.spec}</p>
                    <div className="doctor-rating">★ {doc.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="2. Выберите дату и время">
            <div className="form-group" style={{ maxWidth: '300px' }}>
              <label>Дата приема</label>
              <input 
                type="date" 
                className="form-input" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {selectedDate && (
              <div className="slots-container animate-fadeInUp">
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Доступное время</label>
                <div className="slots-grid">
                  {SLOTS.map(slot => {
                    const isDisabled = Math.random() > 0.7; // simulate booked slots
                    return (
                      <div 
                        key={slot} 
                        className={`time-slot ${isDisabled ? 'disabled' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => !isDisabled && setSelectedSlot(slot)}
                      >
                        {slot}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button 
                className="btn-primary" 
                onClick={handleBooking}
                disabled={!selectedDoc || !selectedDate || !selectedSlot}
              >
                Подтвердить запись
              </button>
              {successMsg && (
                <span style={{ color: 'var(--accent-green)', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCheck /> {successMsg}
                </span>
              )}
            </div>
          </SectionCard>

        </div>

        {/* ── Right column: Upcoming Appointments ── */}
        <div>
          <SectionCard title="Предстоящие визиты">
            {appointments.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Нет запланированных приёмов</p>
            ) : (
              <div className="upcoming-list">
                {appointments.map(app => (
                  <div key={app.id} className="upcoming-item animate-scaleIn">
                    <div className="upcoming-date">
                      <div className="u-day">{app.displayDate.day}</div>
                      <div className="u-month">{app.displayDate.month}</div>
                    </div>
                    <div className="upcoming-details">
                      <h4>{app.spec}</h4>
                      <p><FiUser size={12}/> {app.docName}</p>
                      <p><FiClock size={12}/> {app.time}</p>
                    </div>
                    <button className="btn-cancel" onClick={() => cancelAppointment(app.id)} title="Отменить запись">
                      <FiX size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default Appointments;