import { useState, useEffect } from "react";
import { db } from "../firebase";
import { onSnapshot, collection } from "firebase/firestore";
import { toast } from "react-toastify";
import fileImg from "../assets/files-icon.png"

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

  const isImage = (url) => {
    return url.match(/\.(jpeg|jpg|gif|png)$/) != null;
  };

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

  const getDirectDownloadURL = (url) => {
    return url.includes('?alt=media') ? url : `${url}?alt=media`;
  };

  const handleDownload = (url) => {
    const a = document.createElement('a');
    a.href = getDirectDownloadURL(url);
    a.download = url.split('/').pop(); // Use file name from URL
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      <h2>Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <div className="titleAndContent">
              {note.title && <strong>{note.title}</strong>}
              <br />
              {note.text}
            </div>
            {note.fileURL && (
              <div className="previewAndButton">
                <a href={note.fileURL}>
                  <img
                    src={isImage(note.text) ? note.fileURL : fileImg}
                    alt={note.title || "Preview"}
                    style={{ width: "100px", height: "100px" }}
                  />
                </a>
                <button onClick={() => handleDownload(note.fileURL)}>
                  Download
                </button>
              </div>
            )}
            {!note.fileURL && (
              <button onClick={() => copyToClipboard(note.text)}>
                Copy
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
