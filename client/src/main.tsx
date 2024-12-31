import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AiAssistantProvider } from "./lib/ai-context";
import App from './App';
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AiAssistantProvider>
        <App />
        <Toaster />
      </AiAssistantProvider>
    </QueryClientProvider>
  </StrictMode>,
);