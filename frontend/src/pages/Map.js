import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Custom emoji icons
const userIcon = L.divIcon({
  className: 'custom-map-icon',
  html: '<div style="font-size:32px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))">📍</div>',
  iconSize: [32, 40], iconAnchor: [16, 40],
});

const clinicIcon = L.divIcon({
  className: 'custom-map-icon',
  html: '<div style="font-size:32px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))">🏥</div>',
  iconSize: [32, 40], iconAnchor: [16, 40],
});

const pharmacyIcon = L.divIcon({
  className: 'custom-map-icon',
  html: '<div style="font-size:28px;filter:drop-shadow(0 4px 8px rgba(0,0,0,0.3))">💊</div>',
  iconSize: [28, 36], iconAnchor: [14, 36],
});

// FIXED: use useEffect to avoid re-render loop
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center[0], center[1]]);
  return null;
}

const DEFAULT_POS = [51.169392, 71.449074]; // Astana center
const DEFAULT_CLINICS = [
  { id: 1, name: 'Детская поликлиника №1', type: 'Государственная', address: 'ул. Абая, 45', emoji: '🏥', lat: 51.174, lng: 71.454, phone: '+7 (7172) 55-00-01', rating: 4.5, open: '08:00-18:00' },
  { id: 2, name: 'Реабилитационный центр «Нур»', type: 'Логопедия и ЗПР', address: 'пр. Достык, 12', emoji: '🏥', lat: 51.165, lng: 71.457, phone: '+7 (7172) 55-00-02', rating: 4.8, open: '09:00-19:00' },
  { id: 3, name: 'Детская больница №3', type: 'Стационар', address: 'ул. Сейфуллина, 78', emoji: '🏥', lat: 51.177, lng: 71.446, phone: '+7 (7172) 55-00-03', rating: 4.3, open: '24/7' },
  { id: 4, name: 'Аптека «Биосфера»', type: 'Аптека 24/7', address: 'ул. Сейфуллина, 102', emoji: '💊', lat: 51.171, lng: 71.443, phone: '+7 (7172) 55-00-04', rating: 4.6, open: '24/7' },
  { id: 5, name: 'Центр развития «Кенгуру»', type: 'ЗРР / ЗПР', address: 'пр. Республики, 55', emoji: '🏥', lat: 51.162, lng: 71.445, phone: '+7 (7172) 55-00-05', rating: 4.9, open: '10:00-18:00' },
];

function Map() {
  const [position, setPosition]     = useState(DEFAULT_POS);
  const [hasLocation, setHasLocation] = useState(false);
  const [locError, setLocError]     = useState('');
  const [clinics, setClinics]       = useState(DEFAULT_CLINICS);
  const [activeClinic, setActiveClinic] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Геолокация не поддерживается браузером');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        const { latitude: lat, longitude: lng } = loc.coords;
        setPosition([lat, lng]);
        setHasLocation(true);
        setClinics([
          { ...DEFAULT_CLINICS[0], lat: lat + 0.005, lng: lng + 0.005 },
          { ...DEFAULT_CLINICS[1], lat: lat - 0.004, lng: lng + 0.008 },
          { ...DEFAULT_CLINICS[2], lat: lat + 0.008, lng: lng - 0.003 },
          { ...DEFAULT_CLINICS[3], lat: lat + 0.002, lng: lng - 0.006 },
          { ...DEFAULT_CLINICS[4], lat: lat - 0.007, lng: lng - 0.004 },
        ]);
      },
      () => {
        setLocError('Разрешите доступ к геолокации в браузере для отображения ближайших клиник');
      }
    );
  }, []);

  const getIcon = (emoji) => emoji === '💊' ? pharmacyIcon : clinicIcon;
  const renderStars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
  const visibleClinics = clinics.filter((clinic) => {
    if (filter === 'all') return true;
    if (filter === 'pharmacy') return clinic.emoji === '💊';
    if (filter === 'speech') return clinic.type.toLowerCase().includes('зпр') || clinic.type.toLowerCase().includes('логоп');
    if (filter === 'open') return clinic.open === '24/7';
    return true;
  });

  return (
    <div className="map-page-container animate-fadeInUp">
      <div className="map-header">
        <div>
          <h1>Ближайшие клиники и центры</h1>
          <p>GPS-навигация по медицинским учреждениям вашего города</p>
        </div>
        {hasLocation && (
          <span className="map-badge">
            📍 Местоположение определено · {visibleClinics.length} объектов рядом
          </span>
        )}
      </div>

      {locError && (
        <div className="map-error-banner">
          ⚠️ {locError}. Карта отображает центр Астаны по умолчанию.
        </div>
      )}

      <div className="map-filter-row">
        {[
          { id: 'all', label: 'Все' },
          { id: 'speech', label: 'Логопедия / ЗПР' },
          { id: 'pharmacy', label: 'Аптеки' },
          { id: 'open', label: '24/7' },
        ].map((item) => (
          <button key={item.id} className={`map-filter ${filter === item.id ? 'active' : ''}`} onClick={() => setFilter(item.id)}>
            {item.label}
          </button>
        ))}
      </div>

      <div className="map-layout">
        {/* Map */}
        <div className="map-wrapper">
          <MapContainer center={position} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
            <ChangeView center={position} zoom={14} />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {hasLocation && (
              <Marker position={position} icon={userIcon}>
                <Popup><strong>📍 Вы здесь</strong></Popup>
              </Marker>
            )}
            {visibleClinics.map((c) => (
              <Marker
                key={c.id}
                position={[c.lat, c.lng]}
                icon={getIcon(c.emoji)}
                eventHandlers={{ click: () => setActiveClinic(c) }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <strong style={{ fontSize: 14 }}>{c.name}</strong><br />
                    <span style={{ color: '#64748b', fontSize: 12 }}>{c.type}</span><br />
                    <span style={{ fontSize: 12 }}>{c.address}</span><br />
                    <span style={{ color: '#F59E0B', fontSize: 13 }}>{renderStars(c.rating)}</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar list */}
        <div className="clinics-sidebar">
          <div className="clinics-sidebar-title">Учреждения рядом</div>
          {!hasLocation && !locError && (
            <div className="map-loading">
              <div className="spinner spinner-dark" />
              <span>Определяем местоположение...</span>
            </div>
          )}
          {visibleClinics.map((c) => (
            <div
              key={c.id}
              className={`clinic-card ${activeClinic?.id === c.id ? 'active' : ''}`}
              onClick={() => setActiveClinic(c)}
            >
              <div className="clinic-icon">{c.emoji}</div>
              <div className="clinic-info">
                <h4>{c.name}</h4>
                <p className="clinic-type">{c.type}</p>
                <p className="clinic-address">📍 {c.address}</p>
                <p className="clinic-address">🕘 {c.open}</p>
                <div className="clinic-rating">{renderStars(c.rating)} {c.rating}</div>
              </div>
            </div>
          ))}

          {activeClinic && (
            <div className="clinic-detail-panel">
              <h3>{activeClinic.name}</h3>
              <p>{activeClinic.type}</p>
              <p>{activeClinic.address}</p>
              <p>Режим: {activeClinic.open}</p>
              <p>{activeClinic.phone}</p>
              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => window.open(`https://2gis.kz/search/${encodeURIComponent(activeClinic.name)}`, '_blank')}
              >
                🗺️ Маршрут в 2GIS
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Map;
