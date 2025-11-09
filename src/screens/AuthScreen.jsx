// src/screens/ProfileScreen.jsx (TAM VE EKSİKSİZ KOD - DÜZENLEME FORMU DAHİL)

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { auth, db } from '../firebaseConfig'; 
import { signOut } from 'firebase/auth';
import { 
  doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot,
  addDoc, collection, serverTimestamp 
} from 'firebase/firestore'; 
import { BiSolidPencil, BiArrowBack } from 'react-icons/bi'; 

// --- YARDIMCI BİLEŞEN 1: Ayar Satırı ---
const SettingItem = ({ icon, text, hasArrow = true, onClick }) => (
  <button className="setting-item" onClick={onClick}>
    <span className="setting-icon">{icon}</span><span className="setting-text">{text}</span>
    {hasArrow && <span className="setting-arrow">&#x276F;</span>}
  </button>
);

// --- YARDIMCI BİLEŞEN 2: Form Alanı ---
const FormInput = ({ label, value, onChange, disabled = false }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    <input 
      type="text" 
      className="form-input" 
      value={value} 
      onChange={onChange}
      disabled={disabled}
    />
  </div>
);

// --- YARDIMCI BİLEŞEN 3: PROFİL DÜZENLEME FORMU (EKSİK OLAN KISIM) ---
function EditProfileForm({ user, onBack, onSave }) {
  const [name, setName] = useState(user.name);
  const [surname, setSurname] = useState(user.surname);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Kullanıcı adı kuralı kontrolü
  let usernameDisabled = false;
  let usernameHelpText = "Kullanıcı adınızı 2 haftada bir değiştirebilirsiniz.";
  
  if (user.usernameLastChanged) {
    const msInDay = 86400000;
    const lastChangedTime = user.usernameLastChanged.toDate().getTime();
    const daysSinceChange = (Date.now() - lastChangedTime) / msInDay;

    if (daysSinceChange < 14) {
      usernameDisabled = true;
      const daysLeft = Math.ceil(14 - daysSinceChange);
      usernameHelpText = `Kullanıcı adınızı değiştirmek için ${daysLeft} gün beklemelisiniz.`;
    }
  }

  // Kaydetme Fonksiyonu
  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const userDocRef = doc(db, "users", user.uid);
      const dataToUpdate = { name, surname, bio };

      if (username !== user.username && !usernameDisabled) {
        dataToUpdate.username = username;
        dataToUpdate.usernameLastChanged = serverTimestamp();
      }

      await updateDoc(userDocRef, dataToUpdate);
      setLoading(false);
      onSave(); // Kaydettikten sonra ana profile dön
      
    } catch (err) {
      setError("Kaydederken bir hata oluştu: " + err.message);
      setLoading(false);
    }
  };

  const handleEmailChangeClick = () => {
    alert("E-posta değişimi bir sonraki adımda eklenecek.");
  };

  return (
    <div className="edit-profile-form">
      <header className="header chat-header">
        <button className="back-button" onClick={onBack}>
          <BiArrowBack />
        </button>
        <div className="chat-header-info"><h2>Profili Düzenle</h2></div>
      </header>

      <div className="form-content">
        <FormInput label="İsim" value={name} onChange={(e) => setName(e.target.value)} />
        <FormInput label="Soyisim" value={surname} onChange={(e) => setSurname(e.target.value)} />
        <FormInput label="Kullanıcı Adı" value={username} onChange={(e) => setUsername(e.target.value)} disabled={usernameDisabled} />
        <p className={`form-help-text ${usernameDisabled ? 'disabled' : ''}`}>{usernameHelpText}</p>

        <div className="form-group">
          <label className="form-label">Bio</label>
          <textarea className="form-input" rows="4" value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="form-group">
          <label className="form-label">E-posta</label>
          <input type="text" className="form-input" value={user.email} disabled={true} />
          <button className="email-change-button" onClick={handleEmailChangeClick}>E-postayı Değiştir</button>
        </div>
        
        {error && <p className="form-error-text">{error}</p>}

        <button className="auth-button save-button" onClick={handleSave} disabled={loading}>
          {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}


// --- ANA PROFİL EKRANI ---
// (Artık hem Görüntüleme hem Düzenleme modunu içeriyor)
function ProfileScreen({ userId, onBack, onMessageClick }) {
  
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [isMyProfile, setIsMyProfile] = useState(false); 
  const [isFollowing, setIsFollowing] = useState(false); 
  const [isEditing, setIsEditing] = useState(false); // DÜZENLEME MODU STATE'İ

  const currentUser = auth.currentUser;
  const profileUserId = userId || currentUser.uid; 

  // Veri Çekme Efekti
  useEffect(() => {
    const userDocRef = doc(db, "users", profileUserId);
    // Veriyi 'onSnapshot' ile (gerçek zamanlı) dinliyoruz
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
      // Takip durumunu 'onSnapshot' ile (gerçek zamanlı) dinliyoruz
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
    if (!isMyProfile) return; // Başkasının resmini değiştiremeyiz
    const currentUser = auth.currentUser;
    const newProfilePicUrl = prompt("Yeni profil resmi URL'si:", user.profilePicUrl);
    if (newProfilePicUrl && newProfilePicUrl !== user.profilePicUrl) {
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        await updateDoc(userDocRef, { profilePicUrl: newProfilePicUrl });
        // (onSnapshot sayesinde 'setUser' yapmaya gerek yok, kendi güncellenir)
      } catch (err) { alert("Hata: URL güncellenemedi."); }
    }
  };

  const handleLogout = async () => { await signOut(auth); };
  
  // --- ANA RENDER ---

  if (loading) return <div className="placeholder-screen"><h1>Profil Yükleniyor...</h1></div>;
  if (!user) return <div className="placeholder-screen"><h1>Kullanıcı bulunamadı.</h1></div>;

  // MOD 1: DÜZENLEME MODU
  if (isEditing) {
    return (
      <EditProfileForm 
        user={user} 
        onBack={() => setIsEditing(false)}
        onSave={() => {
          setIsEditing(false);
          // (Veri 'onSnapshot' ile dinlendiği için 'fetchUserData'ye gerek yok)
        }}
      />
    );
  }

  // MOD 2: GÖRÜNTÜLEME MODU (VARSAYILAN)
  return (
    <div className="profile-screen-container">
      <header className="profile-header">
        {!isMyProfile && (
          <button className="back-button" onClick={onBack} style={{position: 'absolute', top: '10px', left: '10px'}}>
            <BiArrowBack />
          </button>
        )}
        
        <div className="profile-pic-wrapper" onClick={handleEditPicture}>
          <img src={user.profilePicUrl} alt="Profil" className="profile-pic" />
          {isMyProfile && <div className="profile-pic-overlay"><BiSolidPencil /></div>}
        </div>
        
        <h2>{user.name}</h2>
        <p className="username">@{user.username}</p>
      </header>
      
      {/* Gerçek İstatistikler */}
      <div className="profile-stats">
        <div className="stat-item"><strong>0</strong><span>Gönderi</span></div>
        <div className="stat-item"><strong>{user.followers ? user.followers.length : 0}</strong><span>Takipçi</span></div>
        <div className="stat-item"><strong>{user.following ? user.following.length : 0}</strong><span>Takip</span></div>
      </div>
      
      <div className="profile-bio">
        <p>{user.bio || 'Henüz bir biyografi yok.'}</p>
      </div>

      {isMyProfile ? (
        // EĞER BENİM PROFİLİMSE
        <div className="settings-menu">
          <SettingItem icon="✏️" text="Profili Düzenle" onClick={() => setIsEditing(true)} />
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