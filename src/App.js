// src/App.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import "./App.css"

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notes'), (snapshot) => {
      const newNotes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNotes(newNotes);
    });

    return () => unsubscribe();
  }, []);

  const addNote = async () => {
    if (newNote.trim() !== '') {
      await addDoc(collection(db, 'notes'), {
        text: newNote,
        timestamp: serverTimestamp(),
      });
      setNewNote('');
    }
  };

  return (
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
        <h2>Notes</h2>
        <ul>
          {notes.map((note) => (
            <li key={note.id}>{note.text}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;
