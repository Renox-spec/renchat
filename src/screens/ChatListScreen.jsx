// src/screens/ChatListScreen.jsx (DOĞRU KOD)

import React, { useState, useEffect } from 'react';
import '../App.css';
import { auth, db } from '../firebaseConfig';
import { collection, onSnapshot, query } from 'firebase/firestore'; 

const UserListItem = ({ user, onClick }) => (
  <button className="chat-list-item" onClick={onClick}>
    <img src={user.profilePicUrl} alt={user.username} className="chat-list-pic" />
    <div className="chat-list-details">
      <span className="chat-list-name">{user.name}</span>
      <span className="chat-list-message">@{user.username}</span>
    </div>
  </button>
);

// BU EKRAN 'onUserClick' PROP'UNU ALIR
function ChatListScreen({ onUserClick }) { 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return; 
    const usersColRef = collection(db, "users");
    const q = query(usersColRef);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const allUsers = []; 
      querySnapshot.forEach((doc) => allUsers.push(doc.data()));
      const otherUsers = allUsers.filter(user => user.uid !== currentUser.uid);
      setUsers(otherUsers); 
      setLoading(false);
    }, (error) => console.error("Kullanıcıları çekerken hata: ", error));
    return () => unsubscribe();
  }, []); 

  return (
    <div className="chat-list-container">
      <header className="header"><h1>Kullanıcılar</h1></header>
      <div className="chat-search-bar"><input type="text" placeholder="Kullanıcılarda ara..." /></div>
      <div className="conversations-wrapper">
        {loading && <div className="placeholder-screen">Yükleniyor...</div>}
        
        {!loading && users.map(user => (
          <UserListItem
            key={user.uid}
            user={user}
            // TIKLANDIĞINDA 'onUserClick' FONKSİYONUNU ÇAĞIRIR
            onClick={() => onUserClick(user)}
          />
        ))}
        
        {!loading && users.length === 0 && (
          <div className="placeholder-screen"><p>Sohbet edecek başka kullanıcı bulunamadı.</p></div>
        )}
      </div>
    </div>
  );
}
export default ChatListScreen;