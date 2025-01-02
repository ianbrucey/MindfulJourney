import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AiAssistantProvider } from "@sista/ai-assistant-react";
import App from './App';
import "./index.css";
import dotenv from "dotenv";
dotenv.config();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AiAssistantProvider apiKey={import.meta.env.VITE_SISTA_API_KEY || process.env.VITE_SISTA_API_KEY}>
        <App />
        <Toaster />
      </AiAssistantProvider>
    </QueryClientProvider>
  </StrictMode>,
);