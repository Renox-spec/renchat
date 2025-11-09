// src/App.jsx (TAM VE DOĞRU KOD)

import { useState, useEffect } from 'react';
import './App.css';
import AuthScreen from './screens/AuthScreen'; 
import MainLayout from './layouts/MainLayout'; 
import { auth } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Firebase'i dinle
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Yükleniyor ekranı
  // ...
  if (authLoading) {
    return (
      // Aynı 'auth-page-container' stilini kullanarak
      // GIF'in tam ortada olmasını sağlıyoruz.
      <div className="auth-page-container">
        <img img src="/loader.gif" alt="Yükleniyor..." className="loading-gif" />
      </div>
    );
  }
// ...

  // Yönlendirme
  if (user) {
    return <MainLayout />; // Kullanıcı varsa Ana Sayfa
  } else {
    return <AuthScreen />; // Kullanıcı yoksa Giriş Ekranı
  }
}

export default App;