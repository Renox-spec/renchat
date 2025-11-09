// src/screens/NotificationsScreen.jsx (YENİ DOSYA)

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { BiArrowBack } from 'react-icons/bi';
import { auth, db } from '../firebaseConfig';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// Tek bir bildirim satırı
const NotificationItem = ({ notification }) => {
  // Zamanı formatlama (çok basitçe)
  const timeAgo = notification.timestamp 
    ? notification.timestamp.toDate().toLocaleTimeString() 
    : '...';

  return (
    <div className="notification-item">
      <img 
        src={notification.fromUser.profilePicUrl} 
        alt={notification.fromUser.username} 
        className="chat-list-pic" 
      />
      <div className="notification-details">
        {/* Kullanıcı adını kalın yap */}
        <strong>@{notification.fromUser.username}</strong>
        {notification.type === 'follow' && ' sizi takip etmeye başladı.'}
        {/* Başka bildirim tipleri (like, comment) buraya eklenebilir */}
      </div>
      <span className="notification-time">{timeAgo}</span>
    </div>
  );
};

// Bildirimler Ana Ekranı
function NotificationsScreen({ onBack }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bildirimleri gerçek zamanlı dinle
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // Kendi profilimizdeki 'notifications' koleksiyonunu
    // zaman damgasına göre (en yeni en üstte) dinle
    const q = query(
      collection(db, "users", currentUser.uid, "notifications"),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="notifications-screen-container">
      <header className="header chat-header">
        <button className="back-button" onClick={onBack}>
          <BiArrowBack />
        </button>
        <div className="chat-header-info">
          <h2>Bildirimler</h2>
        </div>
      </header>

      <div className="notifications-list">
        {loading && <p className="placeholder-screen">Yükleniyor...</p>}
        
        {!loading && notifications.length === 0 && (
          <p className="placeholder-screen">Henüz bildiriminiz yok.</p>
        )}

        {!loading && notifications.map(notif => (
          <NotificationItem key={notif.id} notification={notif} />
        ))}
      </div>
    </div>
  );
}

export default NotificationsScreen;