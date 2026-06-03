import React, { useEffect, useState } from 'react';
import SectionCard from '../components/SectionCard';
import { FiGift, FiStar, FiShoppingBag } from 'react-icons/fi';
import api from '../utils/api';
import Games from './Games';
import './ChildZone.css';

function ChildZone() {
  const [shop, setShop] = useState({ coins: 0, items: [], purchases: [] });
  const [message, setMessage] = useState('');

  const loadShop = () => {
    api.getRewardShop()
      .then((data) => setShop(data))
      .catch((err) => setMessage(err.message || 'Не удалось загрузить магазин'));
  };

  useEffect(() => {
    loadShop();
  }, []);

  const buy = async (itemId) => {
    setMessage('');
    try {
      await api.buyReward({ itemId });
      setMessage('Покупка сохранена');
      loadShop();
    } catch (error) {
      setMessage(error.message || 'Не удалось купить награду');
    }
  };

  return (
    <div className="child-zone-page">
      <div className="child-hero">
        <div>
          <h1>Детский режим</h1>
          <p>Играй, развивайся, получай койны и открывай награды.</p>
        </div>
        <div className="coin-wallet"><FiStar /> {shop.coins} койнов</div>
      </div>

      <SectionCard title="Магазин наград">
        {message && <div className="child-message">{message}</div>}
        <div className="reward-grid">
          {shop.items.map((item) => (
            <div className="reward-card" key={item.id}>
              <div className="reward-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p><FiGift size={13} /> {item.price} койнов</p>
              <button className="btn-primary" onClick={() => buy(item.id)} disabled={shop.coins < item.price}>
                <FiShoppingBag size={14} /> Купить
              </button>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Мои покупки">
        {shop.purchases.length === 0 ? (
          <p className="child-empty">Пока нет покупок. Сыграй в игры и заработай койны.</p>
        ) : (
          <div className="purchase-list">
            {shop.purchases.map((item) => (
              <div key={item.id} className="purchase-item">{item.title}</div>
            ))}
          </div>
        )}
      </SectionCard>

      <Games />
    </div>
  );
}

export default ChildZone;
