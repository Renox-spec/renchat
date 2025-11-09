// src/screens/SearchScreen.jsx (YENİ DOSYA)

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { BiArrowBack } from 'react-icons/bi'; // Geri ikonu
import { auth, db } from '../firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore'; 

// Arama sonucunda çıkan kullanıcılar için liste bileşeni
const UserListItem = ({ user, onClick }) => (
  <button className="chat-list-item" onClick={onClick}>
    <img src={user.profilePicUrl} alt={user.username} className="chat-list-pic" />
    <div className="chat-list-details">
      <span className="chat-list-name">{user.name}</span>
      <span className="chat-list-message">@{user.username}</span>
    </div>
  </button>
);

// Arama Ekranı
function SearchScreen({ onBack, onUserClick }) {
  const [searchTerm, setSearchTerm] = useState(""); // Arama kutusundaki yazı
  const [results, setResults] = useState([]); // Arama sonuçları
  const [loading, setLoading] = useState(false);

  // Arama terimi (searchTerm) her değiştiğinde arama yap
  useEffect(() => {
    // Boşsa arama yapma
    if (searchTerm.trim() === "") {
      setResults([]);
      return;
    }
    
    setLoading(true);
    const currentUser = auth.currentUser;

    // Sorgu: "users" koleksiyonunda, 'username' alanı 'searchTerm' ile başlayan
    // ve kendimiz olmayan kullanıcıları getir.
    const q = query(
      collection(db, "users"),
      where("username", ">=", searchTerm.toLowerCase()),
      where("username", "<=", searchTerm.toLowerCase() + '\uf8ff'), // 'ile başlayan' sorgusu
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersList = [];
      querySnapshot.forEach((doc) => {
        // Kendimizi sonuçlardan çıkar
        if(doc.data().uid !== currentUser.uid) {
          usersList.push(doc.data());
        }
      });
      setResults(usersList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [searchTerm]); // searchTerm değiştikçe bu 'useEffect' yeniden çalışır

  return (
    <div className="search-screen-container">
      <header className="header chat-header"> {/* ChatScreen'in başlığıyla aynı stili kullanır */}
        <button className="back-button" onClick={onBack}>
          <BiArrowBack />
        </button>
        <div className="chat-header-info">
          <h2>Kullanıcı Ara</h2>
        </div>
      </header>

      {/* Arama Çubuğu */}
      <div className="search-bar-wrapper">
        <input
          type="text"
          placeholder="Kullanıcı adı ile ara..."
          className="search-input-field"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Arama Sonuçları */}
      <div className="search-results">
        {loading && <p className="placeholder-screen">Aranıyor...</p>}
        
        {!loading && results.map(user => (
          <UserListItem 
            key={user.uid} 
            user={user} 
            onClick={() => onUserClick(user)} 
          />
        ))}

        {!loading && results.length === 0 && searchTerm.trim() !== "" && (
          <p className="placeholder-screen">Sonuç bulunamadı.</p>
        )}
      </div>
    </div>
  );
}

export default SearchScreen;