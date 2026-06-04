import React, { useState, useEffect, useMemo } from 'react';
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

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, map, zoom]);
  return null;
}

const DEFAULT_POS = [51.169392, 71.449074]; // Astana center
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

function tagValue(tags = {}, keys) {
  return keys.map((key) => tags[key]).find(Boolean) || '';
}

function objectType(tags = {}) {
  const amenity = tags.amenity || '';
  const healthcare = tags.healthcare || '';
  if (amenity === 'pharmacy') return 'Аптека';
  if (healthcare === 'speech_therapist') return 'Логопедия';
  if (healthcare === 'psychotherapist' || healthcare === 'psychologist') return 'Психолог';
  if (healthcare === 'clinic' || amenity === 'clinic') return 'Клиника';
  if (healthcare === 'doctor' || amenity === 'doctors') return 'Врачебный кабинет';
  if (amenity === 'hospital') return 'Больница';
  return 'Медицинский объект';
}

function addressFromTags(tags = {}) {
  const street = tagValue(tags, ['addr:street']);
  const house = tagValue(tags, ['addr:housenumber']);
  const city = tagValue(tags, ['addr:city']);
  return [street && house ? `${street}, ${house}` : street || house, city].filter(Boolean).join(', ');
}

function normalizeOsmElement(element) {
  const tags = element.tags || {};
  const lat = element.lat || element.center?.lat;
  const lng = element.lon || element.center?.lon;
  if (!lat || !lng || !tags.name) return null;
  return {
    id: `${element.type}-${element.id}`,
    name: tags.name,
    type: objectType(tags),
    address: addressFromTags(tags),
    phone: tagValue(tags, ['phone', 'contact:phone']),
    website: tagValue(tags, ['website', 'contact:website']),
    open: tagValue(tags, ['opening_hours']),
    lat,
    lng,
    isPharmacy: tags.amenity === 'pharmacy',
  };
}

async function fetchNearbyMedicalObjects([lat, lng]) {
  const query = `
    [out:json][timeout:25];
    (
      node(around:5000,${lat},${lng})["amenity"~"hospital|clinic|doctors|pharmacy"];
      way(around:5000,${lat},${lng})["amenity"~"hospital|clinic|doctors|pharmacy"];
      relation(around:5000,${lat},${lng})["amenity"~"hospital|clinic|doctors|pharmacy"];
      node(around:5000,${lat},${lng})["healthcare"~"clinic|doctor|speech_therapist|psychologist|psychotherapist|rehabilitation"];
      way(around:5000,${lat},${lng})["healthcare"~"clinic|doctor|speech_therapist|psychologist|psychotherapist|rehabilitation"];
      relation(around:5000,${lat},${lng})["healthcare"~"clinic|doctor|speech_therapist|psychologist|psychotherapist|rehabilitation"];
    );
    out center tags 40;
  `;
  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ data: query }),
  });
  if (!response.ok) throw new Error('Не удалось получить объекты с OpenStreetMap');
  const data = await response.json();
  return (data.elements || []).map(normalizeOsmElement).filter(Boolean).slice(0, 30);
}

function Map() {
  const [position, setPosition]     = useState(DEFAULT_POS);
  const [hasLocation, setHasLocation] = useState(false);
  const [locError, setLocError]     = useState('');
  const [clinics, setClinics]       = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [activeClinic, setActiveClinic] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let mounted = true;
    const loadObjects = async (coords, userLocated) => {
      setMapLoading(true);
      try {
        const objects = await fetchNearbyMedicalObjects(coords);
        if (!mounted) return;
        setClinics(objects);
        setHasLocation(userLocated);
      } catch (error) {
        if (!mounted) return;
        setClinics([]);
        setLocError((prev) => prev || error.message || 'Не удалось загрузить медицинские объекты');
      } finally {
        if (mounted) setMapLoading(false);
      }
    };

    if (!navigator.geolocation) {
      setLocError('Геолокация не поддерживается браузером');
      loadObjects(DEFAULT_POS, false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        const { latitude: lat, longitude: lng } = loc.coords;
        const coords = [lat, lng];
        setPosition(coords);
        loadObjects(coords, true);
      },
      () => {
        setLocError('Разрешите доступ к геолокации в браузере для отображения ближайших клиник');
        loadObjects(DEFAULT_POS, false);
      }
    );

    return () => {
      mounted = false;
    };
  }, []);

  const getIcon = (clinic) => clinic.isPharmacy ? pharmacyIcon : clinicIcon;
  const visibleClinics = useMemo(() => clinics.filter((clinic) => {
    if (filter === 'all') return true;
    if (filter === 'pharmacy') return clinic.isPharmacy;
    if (filter === 'speech') return clinic.type.toLowerCase().includes('логоп') || clinic.type.toLowerCase().includes('психолог');
    if (filter === 'open') return clinic.open && clinic.open.toLowerCase().includes('24/7');
    return true;
  }), [clinics, filter]);

  return (
    <div className="map-page-container animate-fadeInUp">
      <div className="map-header">
        <div>
          <h1>Ближайшие клиники и центры</h1>
          <p>Реальные медицинские объекты из OpenStreetMap рядом с выбранной точкой</p>
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
                icon={getIcon(c)}
                eventHandlers={{ click: () => setActiveClinic(c) }}
              >
                <Popup>
                  <div style={{ minWidth: 180 }}>
                    <strong style={{ fontSize: 14 }}>{c.name}</strong><br />
                    <span style={{ color: '#64748b', fontSize: 12 }}>{c.type}</span><br />
                    {c.address && <span style={{ fontSize: 12 }}>{c.address}</span>}
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar list */}
        <div className="clinics-sidebar">
          <div className="clinics-sidebar-title">Учреждения рядом</div>
          {mapLoading && (
            <div className="map-loading">
              <div className="spinner spinner-dark" />
              <span>Загружаем реальные объекты...</span>
            </div>
          )}
          {!mapLoading && visibleClinics.length === 0 && (
            <div className="map-loading">
              <span>В OpenStreetMap рядом не найдено объектов по выбранному фильтру.</span>
            </div>
          )}
          {visibleClinics.map((c) => (
            <div
              key={c.id}
              className={`clinic-card ${activeClinic?.id === c.id ? 'active' : ''}`}
              onClick={() => setActiveClinic(c)}
            >
              <div className="clinic-icon">{c.isPharmacy ? '💊' : '🏥'}</div>
              <div className="clinic-info">
                <h4>{c.name}</h4>
                <p className="clinic-type">{c.type}</p>
                {c.address && <p className="clinic-address">📍 {c.address}</p>}
                {c.open && <p className="clinic-address">🕘 {c.open}</p>}
              </div>
            </div>
          ))}

          {activeClinic && (
            <div className="clinic-detail-panel">
              <h3>{activeClinic.name}</h3>
              <p>{activeClinic.type}</p>
              {activeClinic.address && <p>{activeClinic.address}</p>}
              {activeClinic.open && <p>Режим: {activeClinic.open}</p>}
              {activeClinic.phone && <p>{activeClinic.phone}</p>}
              {activeClinic.website && <p>{activeClinic.website}</p>}
              <button
                className="btn-primary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => window.open(`https://2gis.kz/search/${encodeURIComponent(activeClinic.name)}`, '_blank', 'noopener,noreferrer')}
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
