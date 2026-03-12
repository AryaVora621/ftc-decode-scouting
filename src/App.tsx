import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppNav from "@/components/AppNav";
import MatchScoutPage from "@/pages/MatchScout";
import PitScoutPage from "@/pages/PitScout";
import DataPage from "@/pages/DataPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner theme="dark" />
      <BrowserRouter>
        <AppNav />
        <Routes>
          <Route path="/" element={<MatchScoutPage />} />
          <Route path="/pit" element={<PitScoutPage />} />
          <Route path="/data/*" element={<DataPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
