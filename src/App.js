// App.js
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios"; // Import Axios
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
  const [title, setTitle] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [uploadTask, setUploadTask] = useState(null);
  const [isCanceled, setIsCanceled] = useState(false);
  const [ipAddress, setIpAddress] = useState(""); // State to hold the IP address

  useEffect(() => {
    // Fetch user's IP address on component mount
    const fetchIpAddress = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        setIpAddress(response.data.ip); // Set IP address
      } catch (error) {
        console.error("Error fetching IP address:", error);
      }
    };

    fetchIpAddress();
  }, []);

  const addNote = async () => {
    if (newNote.trim() !== "") {
      await addDoc(collection(db, "notes"), {
        title,
        text: newNote,
        ipAddress, // Include IP address in the note
        timestamp: serverTimestamp(),
      });
      setNewNote("");
      setTitle("");
    }
  };

  const handleFileUpload = async () => {
    if (file) {
      const fileRef = ref(storage, `files/${file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, file);
      setUploadTask(uploadTask);
      setIsCanceled(false);

      const startTime = Date.now();

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgress(progress);

          const elapsedTime = (Date.now() - startTime) / 1000;
          const speed = (snapshot.bytesTransferred / 1024) / elapsedTime;
          setUploadSpeed(speed.toFixed(2));
        },
        (error) => {
          if (error.code === "storage/canceled") {
            toast.info("Upload canceled!");
          } else {
            toast.error("File upload failed!");
            console.error("Error during file upload:", error);
          }
        },
        async () => {
          if (isCanceled) return;

          const fileURL = await getDownloadURL(fileRef);
          await addDoc(collection(db, "notes"), {
            title,
            text: file.name,
            fileURL,
            ipAddress, // Include IP address in the note
            timestamp: serverTimestamp(),
          });
          toast.success("File uploaded successfully!");
          setFile(null);
          setTitle("");
          setProgress(0);
          setUploadSpeed(0);
          setUploadTask(null);
        }
      );
    }
  };

  const cancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setIsCanceled(true);
      setFile(null);
      setProgress(0);
      setUploadSpeed(0);
      setUploadTask(null);
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
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
          {/* Conditional rendering for Upload and Cancel buttons */}
          {!uploadTask ? (
            <button onClick={handleFileUpload}>Upload File</button>
          ) : (
            <button style={{backgroundColor:"red"}} onClick={cancelUpload}>Cancel Upload</button>
          )}
     {progress > 0 && (
            <div className="progressBar">
              <progress value={progress} max="100"></progress>
              <span>{progress}%</span>
              <div>Speed: {uploadSpeed} KB/s</div>
            </div>
          )}
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
