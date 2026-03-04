import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./components/admin/rich-editor-styles.css";

createRoot(document.getElementById("root")!).render(<App />);
