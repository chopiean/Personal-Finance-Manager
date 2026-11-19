import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AppRouter from "./router/AppRouter";
import FeedbackProvider from "./components/feedback/FeedbackProvider";
import "./index.css";
import "./styles/theme.css";
import "./styles/motion.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FeedbackProvider>
        <AppRouter />
      </FeedbackProvider>
    </BrowserRouter>
  </React.StrictMode>
);
