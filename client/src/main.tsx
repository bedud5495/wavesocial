import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress unhandled rejections and errors from opBNB RPC network issues
// These are expected temporary network issues and handled gracefully by the app
const isRpcError = (error: any) => {
  const message = error?.message || '';
  const code = error?.code;
  return message.includes('missing revert data') || 
         message.includes('missing trie node') ||
         code === 'CALL_EXCEPTION';
};

window.addEventListener('unhandledrejection', (event) => {
  if (isRpcError(event.reason)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}, true);

window.addEventListener('error', (event) => {
  if (isRpcError(event.error)) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
