// src/screens/ChatScreen.jsx (DOĞRU KOD)

import React, { useState, useEffect } from 'react';
import '../App.css'; 
import { BiChevronLeft } from 'react-icons/bi'; 
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';

// BU EKRAN 'user' VE 'onBack' PROP'LARINI ALIR
function ChatScreen({ user, onBack }) { 
  
  const [typedMessage, setTypedMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const currentUser = auth.currentUser;
  
  const chatRoomId = currentUser.uid > user.uid 
      ? `${currentUser.uid}_${user.uid}` 
      : `${user.uid}_${currentUser.uid}`;
  
  const messagesRef = collection(db, "chats", chatRoomId, "messages");

  // Mesajları Dinle
  useEffect(() => {
    const q = query(messagesRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => msgs.push({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });
    return () => unsubscribe();
  }, [chatRoomId]); 

  // Mesaj Gönder
  const handleSendMessage = async (e) => {
    e.preventDefault(); 
    const text = typedMessage.trim();
    if (text === '') return; 
    setTypedMessage(''); 
    await addDoc(messagesRef, {
      text: text,
      senderId: currentUser.uid, 
      timestamp: serverTimestamp(), 
    });
  };

  return (
    <div className="app-container">
      <header className="header chat-header">
        <button className="back-button" onClick={onBack}>
          <BiChevronLeft /> 
        </button>
        <img src={user.profilePicUrl} alt={user.name} className="chat-header-pic" />
        <div className="chat-header-info">
          <h2>{user.name}</h2>
          <span>@{user.username}</span>
        </div>
      </header>

      <div className="messages-list">
        {messages.map((msg) => {
          const isCurrentUser = msg.senderId === currentUser.uid;
          return (
            <div key={msg.id} className={`message-row ${isCurrentUser ? 'current-user' : 'other-user'}`}>
              <div className={`message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`}>
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      <form className="message-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Mesajınızı yazın..."
          value={typedMessage}
          onChange={(e) => setTypedMessage(e.target.value)}
        />
        <button type="submit" className="send-button" disabled={typedMessage.trim() === ''} title="Gönder">&#x27A4;</button>
      </form>
    </div>
  );
}
export default ChatScreen;