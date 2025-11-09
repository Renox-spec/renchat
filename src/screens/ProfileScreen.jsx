// src/screens/ProfileScreen.jsx (TAM VE EKSİKSİZ KOD)

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { auth, db } from '../firebaseConfig'; 
import { signOut } from 'firebase/auth';
import { 
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot,
  addDoc, collection, serverTimestamp 
} from 'firebase/firestore'; 
import { BiSolidPencil, BiArrowBack } from 'react-icons/bi'; 

// SettingItem (Ayar butonu)
const SettingItem = ({ icon, text, hasArrow = true, onClick }) => (
  <button className="setting-item" onClick={onClick}>
    <span className="setting-icon">{icon}</span><span className="setting-text">{text}</span>
    {hasArrow && <span className="setting-arrow">&#x276F;</span>}
  </button>
);

// Ana Profil Ekranı Bileşeni
function ProfileScreen({ userId, onBack, onMessageClick, onEditProfileClick }) {
  
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isMyProfile, setIsMyProfile] = useState(false); 
  const [isFollowing, setIsFollowing] = useState(false); 

  const currentUser = auth.currentUser;
  const profileUserId = userId || currentUser.uid; 

  // Veri Çekme Efekti (Gerçek zamanlı)
  useEffect(() => {
    const userDocRef = doc(db, "users", profileUserId);
    const unsubscribeUser = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        setUser(doc.data());
      } else {
        console.log("Kullanıcı bulunamadı!");
      }
      setLoading(false);
    });

    setIsMyProfile(profileUserId === currentUser.uid);

    let unsubscribeFollowing;
    if (profileUserId !== currentUser.uid) {
      const myDocRef = doc(db, "users", currentUser.uid);
      unsubscribeFollowing = onSnapshot(myDocRef, (doc) => {
        if (doc.exists()) {
          const myData = doc.data();
          setIsFollowing(myData.following.includes(profileUserId));
        }
      });
    }

    return () => {
      unsubscribeUser();
      if (unsubscribeFollowing) unsubscribeFollowing();
    };
  }, [profileUserId, currentUser.uid]); 

  
  // Takip Etme / Takipten Çıkma (Bildirim dahil)
  const handleFollowToggle = async () => {
    const myDocRef = doc(db, "users", currentUser.uid);
    const theirDocRef = doc(db, "users", profileUserId);
    try {
      if (isFollowing) {
        await updateDoc(myDocRef, { following: arrayRemove(profileUserId) });
        await updateDoc(theirDocRef, { followers: arrayRemove(currentUser.uid) });
      } else {
        const myDoc = await getDoc(myDocRef);
        const myData = myDoc.data();
        await updateDoc(myDocRef, { following: arrayUnion(profileUserId) });
        await updateDoc(theirDocRef, { followers: arrayUnion(currentUser.uid) });
        await addDoc(collection(db, "users", profileUserId, "notifications"), {
          type: "follow", seen: false, timestamp: serverTimestamp(),
          fromUser: {
            uid: currentUser.uid,
            username: myData.username,
            profilePicUrl: myData.profilePicUrl
          }
        });
      }
    } catch (err) { console.error("Takip işlemi hatası:", err); }
  };

  // Profil RESMİ düzenleme (Prompt ile)
  const handleEditPicture = async () => {
    if (!isMyProfile) return; 
    const currentUser = auth.currentUser;
    const newProfilePicUrl = prompt("Yeni profil resmi URL'si:", user.profilePicUrl);
    if (newProfilePicUrl && newProfilePicUrl !== user.profilePicUrl) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { profilePicUrl: newProfilePicUrl });
      } catch (err) { alert("Hata: URL güncellenemedi."); }
    }
  };

  const handleLogout = async () => { await signOut(auth); };
  
  // --- ANA RENDER ---

  if (loading) return <div className="placeholder-screen"><h1>Profil Yükleniyor...</h1></div>;
  if (!user) return <div className="placeholder-screen"><h1>Kullanıcı bulunamadı.</h1></div>;

  return (
    <div className="profile-screen-container">
      
      {/* BAŞLIK (Kullanıcı Adı ve Geri Tuşu) */}
      <header className="profile-header new-layout">
        
        {/* Geri tuşu (sadece başkasının profilindeysek) */}
        {!isMyProfile && (
          <button className="back-button" onClick={onBack} style={{position: 'absolute', top: '10px', left: '10px'}}>
            <BiArrowBack />
          </button>
        )}

        {/* @KULLANICI ADI (Yatay yerleşimin üst kısmı) */}
        <p className="username top-username">@{user ? user.username : 'kullaniciadi'}</p>

        {/* FOTOĞRAF VE İSTATİSTİKLERİ SARAN YATAY KUTU */}
        <div className="profile-info-row">
          
          {/* FOTOĞRAF (pp) */}
          <div className="profile-pic-wrapper" onClick={handleEditPicture}>
            <img src={user.profilePicUrl} alt="Profil" className="profile-pic" />
            {isMyProfile && <div className="profile-pic-overlay"><BiSolidPencil /></div>}
          </div>
          
          {/* İSTATİSTİKLER (Gönderi, Takipçi, Takip) */}
          <div className="profile-stats-row">
            <div className="stat-item"><strong>0</strong><span>Gönderi</span></div>
            <div className="stat-item">
              <strong>{user.followers ? user.followers.length : 0}</strong>
              <span>Takipçi</span>
            </div>
            <div className="stat-item">
              <strong>{user.following ? user.following.length : 0}</strong>
              <span>Takip</span>
            </div>
          </div>
        </div>

        {/* İSİM SOYİSİM ve BIO (Yatay yerleşimin alt kısmı) */}
        <h2 className="bottom-name">{user ? `${user.name} ${user.surname}` : 'İsim Yok'}</h2>
        <p className="bottom-bio-text">{user.bio || 'Henüz bir biyografi yok.'}</p>
      
      </header>
      
      {isMyProfile ? (
        // EĞER BENİM PROFİLİMSE
        <div className="settings-menu">
          <SettingItem icon="✏️" text="Profili Düzenle" onClick={onEditProfileClick} />
          <SettingItem icon="⚙️" text="Ayarlar" />
          <SettingItem icon="🚪" text="Çıkış Yap" hasArrow={false} onClick={handleLogout} />
        </div>
      ) : (
        // EĞER BAŞKASININ PROFİLİYSE
        <div className="profile-actions">
          <button className={`profile-action-button ${isFollowing ? 'secondary' : 'primary'}`} onClick={handleFollowToggle}>
            {isFollowing ? 'Takipten Çık' : 'Takip Et'}
          </button>
          <button className="profile-action-button secondary" onClick={() => onMessageClick(user)}>
            Mesaj Gönder
          </button>
        </div>
      )}
    </div>
  );
}

export default ProfileScreen;