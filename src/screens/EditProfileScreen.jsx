// src/screens/EditProfileScreen.jsx (YENİ DOSYA)

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { auth, db } from '../firebaseConfig'; 
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
import { BiArrowBack } from 'react-icons/bi'; 

// --- YARDIMCI BİLEŞEN: Form Alanı ---
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

// --- ANA BİLEŞEN: Profili Düzenleme Ekranı ---
function EditProfileScreen({ onBack }) {
  const [user, setUser] = useState(null); // Yüklenecek kullanıcı verisi
  const [loading, setLoading] = useState(true);
  
  // Form state'leri
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');

  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Kullanıcı adı kuralları
  const [usernameDisabled, setUsernameDisabled] = useState(false);
  const [usernameHelpText, setUsernameHelpText] = useState("Kullanıcı adınızı 2 haftada bir değiştirebilirsiniz.");
  
  const currentUser = auth.currentUser;

  // 1. Ekran açıldığında DÜZENLENECEK KULLANICI verisini çek
  useEffect(() => {
    const fetchUserData = async () => {
      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUser(userData);
        // Formu mevcut verilerle doldur
        setName(userData.name);
        setSurname(userData.surname);
        setUsername(userData.username);
        setBio(userData.bio || "");

        // KULLANICI ADI KURALI KONTROLÜ (2 Hafta)
        if (userData.usernameLastChanged) {
          const msInDay = 86400000;
          const lastChangedTime = userData.usernameLastChanged.toDate().getTime();
          const daysSinceChange = (Date.now() - lastChangedTime) / msInDay;

          if (daysSinceChange < 14) {
            setUsernameDisabled(true);
            const daysLeft = Math.ceil(14 - daysSinceChange);
            setUsernameHelpText(`Kullanıcı adınızı değiştirmek için ${daysLeft} gün beklemelisiniz.`);
          }
        }
      }
      setLoading(false);
    };
    
    fetchUserData();
  }, [currentUser.uid]);

  // 2. KAYDETME FONKSİYONU
  const handleSave = async () => {
    if (saveLoading) return;
    setSaveLoading(true);
    setError("");

    try {
      const userDocRef = doc(db, "users", user.uid);
      const dataToUpdate = { name, surname, bio };

      // Kullanıcı adını değiştirdi mi VE değiştirmesi serbest mi?
      if (username !== user.username && !usernameDisabled) {
        dataToUpdate.username = username;
        dataToUpdate.usernameLastChanged = serverTimestamp();
      }

      await updateDoc(userDocRef, dataToUpdate);
      setSaveLoading(false);
      onBack(); // Kaydettikten sonra profile geri dön
      
    } catch (err) {
      setError("Kaydederken bir hata oluştu: " + err.message);
      setSaveLoading(false);
    }
  };

  // E-posta uyarısı
  const handleEmailChangeClick = () => {
    alert("E-posta değişimi bir sonraki adımda eklenecek.");
  };

  // --- JSX (GÖRÜNÜM) ---

  if (loading) {
    return (
      <div className="edit-profile-form">
        <header className="header chat-header">
          <button className="back-button" onClick={onBack}><BiArrowBack /></button>
          <div className="chat-header-info"><h2>Profili Düzenle</h2></div>
        </header>
        <div className="placeholder-screen"><h1>Yükleniyor...</h1></div>
      </div>
    );
  }

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

        <button className="auth-button save-button" onClick={handleSave} disabled={saveLoading}>
          {saveLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </div>
  );
}

export default EditProfileScreen;