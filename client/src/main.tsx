import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress unhandled rejections from opBNB RPC network issues
// These are expected and handled gracefully by the app
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('missing revert data') || 
      event.reason?.message?.includes('missing trie node') ||
      event.reason?.code === 'CALL_EXCEPTION') {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
