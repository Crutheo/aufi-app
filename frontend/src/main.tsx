import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { BgRemovalProvider } from "./components/BgRemovalProvider";
import { DataProvider } from "./components/DataProvider";
import { App } from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <BgRemovalProvider>
            <App />
          </BgRemovalProvider>
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
