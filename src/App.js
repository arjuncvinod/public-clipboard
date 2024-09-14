import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { db, storage } from "./firebase";
import {
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import Home from "./components/Home";
import Particle from "./components/Particle";

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
            {note.title ? <strong>{note.title}</strong> : null}
            <br />
            {note.text}
            {note.fileURL && (
              <img
                src={note.fileURL}
                alt={note.title || "Preview"}
                style={{ width: "100px", height: "100px" }}
              />
            )}
            <button onClick={() => deleteNote(note.id)} className="delete-btn">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [newNote, setNewNote] = useState("");
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState(""); // Add title state

  const addNote = async () => {
    if (newNote.trim() !== "") {
      await addDoc(collection(db, "notes"), {
        title,
        text: newNote,
        timestamp: serverTimestamp(),
      });
      setNewNote("");
      setTitle(""); // Reset title input
    }
  };

  const handleFileUpload = async () => {
    if (file) {
      const fileRef = ref(storage, `files/${file.name}`);
      await uploadBytes(fileRef, file);
      const fileURL = await getDownloadURL(fileRef);

      await addDoc(collection(db, "notes"), {
        title,
        text: file.name,
        fileURL,
        timestamp: serverTimestamp(),
      });
      toast.success("File uploaded successfully!");
      setFile(null); // Reset file input
      setTitle(""); // Reset title input
    }
  };

  return (
    <Router>
      <div className="App">
        <h1>Public Clipboard</h1>
        <Particle />
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter title..."
          />
          <textarea
            rows="4"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Enter your note..."
          />
          <button onClick={addNote}>Add Note</button>
        </div>
        <div>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button onClick={handleFileUpload}>Upload File</button>
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
