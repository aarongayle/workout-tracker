import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";

const firebaseConfig = {
  apiKey: "AIzaSyAM7nICxVcB9PxENuOTMzI24yIMasyHoX0",
  authDomain: "workout-237ea.firebaseapp.com",
  projectId: "workout-237ea",
  storageBucket: "workout-237ea.appspot.com",
  messagingSenderId: "592948860413",
  appId: "1:592948860413:web:f1da4741cf2fc2c9923594",
};

const app = firebase.initializeApp(firebaseConfig);
export const db = firebase.database;
export const auth = firebase.auth;
export default app;
