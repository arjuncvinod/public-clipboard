// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { db } from "./firebase";
import {
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Home from "./components/Home";
function Admin() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "notes"), (snapshot) => {
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(newNotes);
    });

    return () => unsubscribe();
  }, []);

  const deleteNote = async (noteId) => {
    try {
      await deleteDoc(doc(db, "notes", noteId));
      // Refresh notes after deletion
      const snapshot = await getDocs(collection(db, "notes"));
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(newNotes);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.text}
            <button onClick={() => deleteNote(note.id)} className="delete-btn">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [newNote, setNewNote] = useState("");

  const addNote = async () => {
    if (newNote.trim() !== "") {
      await addDoc(collection(db, "notes"), {
        text: newNote,
        timestamp: serverTimestamp(),
      });
      setNewNote("");
    }
  };

  return (
    <Router>
      <div className="App">
        <h1>Public Clipboard</h1>
        <div>
          <textarea
            rows="4"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
          <button onClick={addNote}>Add Note</button>
        </div>
        <div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </div>
    </Router>
  );
}

export default App;
