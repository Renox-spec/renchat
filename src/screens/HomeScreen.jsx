// src/screens/HomeScreen.jsx (TEMİZLENMİŞ KOD)

import React from 'react';
import '../App.css'; 
// Artık butonlara veya prop'lara gerek yok

function HomeScreen() {
  
  return (
    <div className="home-screen-container">
      
      {/* Sadece basit bir başlık (veya logo) */}
      <header className="header">
        {/* 'home-logo-img' sınıfını genel .header'ın içine aldık */}
        <img src="/logo.png" alt="RenChat Logosu" className="home-logo-img" />
      </header>

      {/* İçerik Akışı (Aynı) */}
      <div className="feed-container placeholder-screen">
        <h2>Akış</h2>
        <p>Takip ettiğiniz kişilerin gönderileri yakında burada olacak.</p>
      </div>

    </div>
  );
}

export default HomeScreen;