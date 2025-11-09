// src/layouts/MainLayout.jsx (TAM VE EKSİKSİZ KOD)

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { BiHomeAlt, BiSearch, BiSend, BiBell, BiUser } from 'react-icons/bi';

// Firebase importları
import { auth, db } from '../firebaseConfig';
import { 
  collection, query, where, onSnapshot, getDocs, writeBatch 
} from 'firebase/firestore'; 

// Tüm Ekranları import et
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChatListScreen from '../screens/ChatListScreen'; 
import ChatScreen from '../screens/ChatScreen'; 
import SearchScreen from '../screens/SearchScreen'; 
import NotificationsScreen from '../screens/NotificationsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

// --- Alt Bar (Doğru ikonlarla) ---
function BottomNavBar({ activeTab, onTabClick, hasNewNotifications }) {
  const tabs = [
    { id: 'home', icon: <BiHomeAlt /> },
    { id: 'search', icon: <BiSearch /> }, 
    { id: 'chat', icon: <BiSend /> }, 
    { id: 'notifications', icon: <BiBell /> }, 
    { id: 'profile', icon: <BiUser /> },
  ];

  return (
    <nav className="bottom-nav-bar">
      {tabs.map((tab) => (
        <button key={tab.id} className={`nav-button ${tab.id === activeTab ? 'active' : ''} ${tab.id === 'chat' ? 'middle' : ''}`}
          onClick={() => onTabClick(tab.id)}>
          <span className="nav-button-icon">
            {tab.icon}
            {/* Kırmızı noktayı Bildirim ikonuna taşıdık */}
            {tab.id === 'notifications' && hasNewNotifications && (
              <div className="notification-badge"></div>
            )}
          </span>
        </button>
      ))}
    </nav>
  );
}

// --- MainLayout (Ana Düzen) ---
function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedChatUser, setSelectedChatUser] = useState(null); 
  const [viewingProfileId, setViewingProfileId] = useState(null); 
  const [hasNewNotifications, setHasNewNotifications] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Bildirim dinleyicisi
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const q = query(
      collection(db, "users", currentUser.uid, "notifications"),
      where("seen", "==", false)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHasNewNotifications(!snapshot.empty);
    });
    return () => unsubscribe();
  }, []);

  // Bildirimleri okundu sayma
  const markNotificationsAsRead = async () => {
    setHasNewNotifications(false);
    const currentUser = auth.currentUser;
    const q = query(
      collection(db, "users", currentUser.uid, "notifications"),
      where("seen", "==", false)
    );
    const snapshot = await getDocs(q);
    if (snapshot.empty) return;
    const batch = writeBatch(db);
    snapshot.forEach(doc => { batch.update(doc.ref, { seen: true }); });
    await batch.commit();
  };

  const openChat = (user) => {
    setViewingProfileId(null);
    setSelectedChatUser(user);
    setIsEditingProfile(false); 
  }

  // Sekme değiştirme
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setSelectedChatUser(null);
    setViewingProfileId(null);
    setIsEditingProfile(false); 
    
    if (tabId === 'notifications') {
      markNotificationsAsRead();
    }
  };

  // EKRAN GÖSTERME MANTIĞI
  const renderContent = () => {
    if (selectedChatUser) return <ChatScreen user={selectedChatUser} onBack={() => setSelectedChatUser(null)} />;
    if (isEditingProfile) return <EditProfileScreen onBack={() => setIsEditingProfile(false)} />;
    if (viewingProfileId) return <ProfileScreen userId={viewingProfileId} onBack={() => setViewingProfileId(null)} onMessageClick={openChat} onEditProfileClick={() => setIsEditingProfile(true)} />;

    switch (activeTab) {
      case 'home':
        return <HomeScreen />;
      case 'search':
        return <SearchScreen onBack={() => setActiveTab('home')} onUserClick={(user) => setViewingProfileId(user.uid)} />;
      case 'chat':
        return <ChatListScreen onUserClick={(user) => setViewingProfileId(user.uid)} />;
      case 'notifications':
        return <NotificationsScreen onBack={() => setActiveTab('home')} />;
      case 'profile':
        return <ProfileScreen onEditProfileClick={() => setIsEditingProfile(true)} />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="auth-page-container">
      <div className="main-app-shell">
        <div className="content-area">{renderContent()}</div>
        <BottomNavBar 
          activeTab={activeTab} 
          onTabClick={handleTabClick} 
          hasNewNotifications={hasNewNotifications}
        />
      </div>
    </div>
  );
}

export default MainLayout;