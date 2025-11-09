// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. BUNU EKLE


// TODO: Firebase'in sana verdiği yapılandırma kodunu buraya yapıştır
const firebaseConfig = {
  apiKey: "AIzaSyDcG5mGmtLBlP8bzkmTzxM2GAczgxMTcEk",
  authDomain: "renchat-f65bf.firebaseapp.com",
  projectId: "renchat-f65bf",
  storageBucket: "renchat-f65bf.firebasestorage.app",
  messagingSenderId: "1066827602621",
  appId: "1:1066827602621:web:4a627a25b0988b980535d4"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// İhtiyacımız olan servisleri başlatıp dışa aktar (export)
// Artık projenin herhangi bir yerinden 'auth' veya 'db' yi çağırabileceğiz
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

