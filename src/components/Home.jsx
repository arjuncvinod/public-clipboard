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
  const downloadFile = (url, filename) => {
    fetch(url)
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      })
      .catch(error => {
        console.error('Download error:', error);
        toast.error('Failed to download file.', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
        });
      });
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
              <img
                  src={isImage(note.text) ? note.fileURL : fileImg}
                  alt={note.title || "Preview"}
                  style={{ width: "100px", height: "100px" }}
                />
                <button onClick={() => downloadFile(note.fileURL, note.title || "file")}>
                  Download
                </button>
              </div>
            )}
            {!note.fileURL &&(
            <button onClick={() => copyToClipboard(note.text)}>Copy</button>)}
          </li>
        ))}
      </ul>
    </div>
  );
}
