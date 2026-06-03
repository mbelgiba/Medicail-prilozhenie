import React, { useEffect, useMemo, useState } from 'react';
import SectionCard from '../components/SectionCard';
import { FiCalendar, FiClock, FiUser, FiX, FiCheck, FiClipboard, FiPhone } from 'react-icons/fi';
import api from '../utils/api';
import './Appointments.css';

const DOCTORS = [
  { id: 1, name: 'Смирнов А.В.', spec: 'Педиатр', rating: 4.9, avatar: '👨‍⚕️' },
  { id: 2, name: 'Иванова Е.С.', spec: 'Логопед-Дефектолог', rating: 4.8, avatar: '👩‍⚕️' },
  { id: 3, name: 'Ким Д.И.',     spec: 'Детский невролог', rating: 4.7, avatar: '👨‍⚕️' },
  { id: 4, name: 'Оспанова А.К.', spec: 'Психолог', rating: 5.0, avatar: '👩‍⚕️' },
];

const SLOTS = ['09:00', '09:30', '10:00', '11:30', '14:00', '14:30', '15:00', '16:30'];
const REASONS = ['Плановый осмотр', 'Температура / ОРВИ', 'Справка', 'Повторный прием', 'Развитие речи', 'Консультация'];
const monthNames = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatDisplayDate(date) {
  const dateObj = new Date(date);
  return { day: dateObj.getDate().toString(), month: monthNames[dateObj.getMonth()] };
}

function Appointments() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadAppointments = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await api.getAppointments();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMsg(error.message || 'Не удалось загрузить записи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const bookedSlots = useMemo(() => {
    return appointments
      .filter((app) => app.date === selectedDate)
      .map((app) => app.time);
  }, [appointments, selectedDate]);

  const handleBooking = async () => {
    if (!selectedDoc || !selectedDate || !selectedSlot) {
      alert('Пожалуйста, выберите врача, дату и время.');
      return;
    }

    const newAppt = {
      doctorId: String(selectedDoc.id),
      docName: selectedDoc.name,
      spec: selectedDoc.spec,
      date: selectedDate,
      time: selectedSlot,
      reason,
      note: note.trim(),
    };

    try {
      const created = await api.addAppointment(newAppt);
      setAppointments([...appointments, created].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setSuccessMsg(`Успешно! Вы записаны к ${selectedDoc.name} на ${selectedDate} в ${selectedSlot}`);
      setTimeout(() => setSuccessMsg(''), 4000);
      setSelectedDoc(null);
      setSelectedDate('');
      setSelectedSlot('');
      setReason(REASONS[0]);
      setNote('');
    } catch (error) {
      setErrorMsg(error.message || 'Не удалось создать запись');
    }
  };

  const cancelAppointment = async (id) => {
    if(window.confirm('Вы уверены, что хотите отменить эту запись?')) {
      try {
        await api.cancelAppointment(id);
        setAppointments(appointments.filter(a => a.id !== id));
      } catch (error) {
        setErrorMsg(error.message || 'Не удалось отменить запись');
      }
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

            <div className="booking-details-grid">
              <div className="form-group">
                <label>Причина визита</label>
                <select className="form-input" value={reason} onChange={(e) => setReason(e.target.value)}>
                  {REASONS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Короткая заметка для врача</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Например: кашель 2 дня, температура 37.8"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            {selectedDate && (
              <div className="slots-container animate-fadeInUp">
                <label style={{ fontSize: '13px', fontWeight: 600 }}>Доступное время</label>
                <div className="slots-grid">
                  {SLOTS.map(slot => {
                    const isDisabled = bookedSlots.includes(slot);
                    return (
                      <div 
                        key={slot} 
                        className={`time-slot ${isDisabled ? 'disabled' : ''} ${selectedSlot === slot ? 'selected' : ''}`}
                        onClick={() => !isDisabled && setSelectedSlot(slot)}
                        title={isDisabled ? 'Это время уже занято' : 'Выбрать время'}
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
              {errorMsg && (
                <span style={{ color: 'var(--accent-red)', fontSize: '13px', fontWeight: 600 }}>
                  {errorMsg}
                </span>
              )}
            </div>
          </SectionCard>

        </div>

        {/* ── Right column: Upcoming Appointments ── */}
        <div>
          <SectionCard title="Предстоящие визиты">
            {loading ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Загружаем записи...</p>
            ) : appointments.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Нет запланированных приёмов</p>
            ) : (
              <div className="upcoming-list">
                {appointments.map(app => (
                  <div key={app.id} className="upcoming-item animate-scaleIn">
                    <div className="upcoming-date">
                      <div className="u-day">{formatDisplayDate(app.date).day}</div>
                      <div className="u-month">{formatDisplayDate(app.date).month}</div>
                    </div>
                    <div className="upcoming-details">
                      <h4>{app.spec}</h4>
                      <p><FiUser size={12}/> {app.docName}</p>
                      <p><FiClock size={12}/> {app.time}</p>
                      <p><FiClipboard size={12}/> {app.reason}</p>
                    </div>
                    <button className="btn-cancel" onClick={() => cancelAppointment(app.id)} title="Отменить запись">
                      <FiX size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="Перед визитом">
            <div className="visit-prep-list">
              <div><FiClipboard /> Возьмите ИИН ребёнка и документы по последним анализам.</div>
              <div><FiCalendar /> Придите за 10 минут до приема, чтобы спокойно оформить талон.</div>
              <div><FiPhone /> Если стало хуже, звоните 103 или в регистратуру клиники.</div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export default Appointments;
