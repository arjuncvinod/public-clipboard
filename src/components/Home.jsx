import { useState, useEffect } from "react";
import { db } from "../firebase";
import { onSnapshot, collection } from "firebase/firestore";
import { toast } from "react-toastify";
export default function Home() {
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

  const copyToClipboard = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    toast.success("Copied to clipboard!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
    });
  };

  return (
    <div>
      <h2>Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.text}
            <button onClick={() => copyToClipboard(note.text)}>Copy</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
