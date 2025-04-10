
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import StockProvider from "@/providers/StockProvider";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Signup";
import PortfolioPage from "./pages/Portfolio";
import StocksPage from "./pages/Stocks";
import TransactionsPage from "./pages/Transactions";
import RequireAuth from "./components/RequireAuth";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <StockProvider>
          <Toaster />
          <Sonner />
          <DashboardProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  } />
                  <Route path="portfolio" element={
                    <RequireAuth>
                      <PortfolioPage />
                    </RequireAuth>
                  } />
                  <Route path="stocks" element={
                    <RequireAuth>
                      <StocksPage />
                    </RequireAuth>
                  } />
                  <Route path="transactions" element={
                    <RequireAuth>
                      <TransactionsPage />
                    </RequireAuth>
                  } />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </DashboardProvider>
        </StockProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
