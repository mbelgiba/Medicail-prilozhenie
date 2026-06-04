import React, { useEffect, useMemo, useState } from 'react';
import SectionCard from '../components/SectionCard';
import { FiCalendar, FiClock, FiUser, FiX, FiCheck, FiClipboard, FiPhone } from 'react-icons/fi';
import api from '../utils/api';
import './Appointments.css';

const SLOTS = ['09:00', '09:30', '10:00', '11:30', '14:00', '14:30', '15:00', '16:30'];
const REASONS = ['Плановый осмотр', 'Температура / ОРВИ', 'Справка', 'Повторный прием', 'Развитие речи', 'Консультация'];
const VISIT_TYPES = ['Первичный приём', 'Повторный приём', 'Контроль динамики', 'Консультация по развитию'];
const LOCATION_TYPES = ['Очно', 'Онлайн'];
const monthNames = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

function formatDisplayDate(date) {
  const dateObj = new Date(date);
  return { day: dateObj.getDate().toString(), month: monthNames[dateObj.getMonth()] };
}

function Appointments() {
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [reason, setReason] = useState(REASONS[0]);
  const [visitType, setVisitType] = useState(VISIT_TYPES[0]);
  const [locationType, setLocationType] = useState(LOCATION_TYPES[0]);
  const [note, setNote] = useState('');
  const [children, setChildren] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
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
    api.getChildren()
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setChildren(items);
        if (items.length > 0) setSelectedChildId(items.find((item) => item.active)?.id || items[0].id);
      })
      .catch((error) => setErrorMsg(error.message || 'Не удалось загрузить детей'));
    api.getDoctors()
      .then((data) => setDoctors(Array.isArray(data) ? data : []))
      .catch((error) => setErrorMsg(error.message || 'Не удалось загрузить врачей'))
      .finally(() => setDoctorsLoading(false));
  }, []);

  useEffect(() => {
    setOccupiedSlots([]);
    setSelectedSlot('');
    if (!selectedDoc?.id || !selectedDate) return;
    api.getAppointmentAvailability(selectedDoc.id, selectedDate)
      .then((data) => setOccupiedSlots(Array.isArray(data?.occupiedSlots) ? data.occupiedSlots : []))
      .catch((error) => setErrorMsg(error.message || 'Не удалось проверить свободные слоты'));
  }, [selectedDoc, selectedDate]);

  const bookedSlots = useMemo(() => occupiedSlots, [occupiedSlots]);

  const handleBooking = async () => {
    if (!selectedChildId || !selectedDoc || !selectedDate || !selectedSlot) {
      alert('Пожалуйста, выберите ребёнка, врача, дату и время.');
      return;
    }

    const newAppt = {
      childId: selectedChildId,
      doctorId: selectedDoc.id,
      date: selectedDate,
      time: selectedSlot,
      visitType,
      locationType,
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
      setVisitType(VISIT_TYPES[0]);
      setLocationType(LOCATION_TYPES[0]);
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
          
          <SectionCard title="1. Выберите ребёнка">
            {children.length === 0 ? (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Сначала добавьте ребёнка в профиле.</p>
            ) : (
              <div className="form-group" style={{ maxWidth: '420px' }}>
                <label>Ребёнок</label>
                <select className="form-input" value={selectedChildId} onChange={(e) => setSelectedChildId(e.target.value)}>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}{child.developmentStatus ? ` · ${child.developmentStatus}` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </SectionCard>

          <SectionCard title="2. Выберите специалиста">
            <div className="doctor-grid">
              {doctorsLoading && <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Загружаем врачей...</p>}
              {!doctorsLoading && doctors.length === 0 && (
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>В системе пока нет врачей. Администратор должен добавить аккаунты специалистов.</p>
              )}
              {doctors.map(doc => (
                <div 
                  key={doc.id} 
                  className={`doctor-card ${selectedDoc?.id === doc.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="doctor-avatar"><FiUser /></div>
                  <div className="doctor-info">
                    <h4>{doc.name}</h4>
                    <p>{doc.specialty || 'Специалист'}</p>
                    <div className="doctor-rating">Код врача: {doc.doctorCode || doc.id}</div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="3. Выберите дату и время">
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
                <label>Тип приёма</label>
                <select className="form-input" value={visitType} onChange={(e) => setVisitType(e.target.value)}>
                  {VISIT_TYPES.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Формат</label>
                <select className="form-input" value={locationType} onChange={(e) => setLocationType(e.target.value)}>
                  {LOCATION_TYPES.map((item) => (
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
                disabled={!selectedChildId || !selectedDoc || !selectedDate || !selectedSlot}
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
                      {app.childName && <p><FiUser size={12}/> {app.childName}</p>}
                      <p><FiUser size={12}/> {app.docName}</p>
                      <p><FiClock size={12}/> {app.time}</p>
                      <p><FiClipboard size={12}/> {app.reason} · {app.visitType || 'Приём'} · {app.locationType || 'Очно'}</p>
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
