
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import StockProvider from './providers/StockProvider';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from 'sonner';
import RequireAuth from './components/RequireAuth';
import Layout from './components/Layout';
import Index from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Stocks from './pages/Stocks';
import Transactions from './pages/Transactions';
import NotFound from './pages/NotFound';
import PaymentSuccess from './pages/PaymentSuccess';
import './App.css';
import { DashboardProvider } from './contexts/DashboardContext';

function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <DashboardProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/" element={<Layout />}>
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/portfolio" element={<RequireAuth><Portfolio /></RequireAuth>} />
                <Route path="/stocks" element={<RequireAuth><Stocks /></RequireAuth>} />
                <Route path="/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Toaster />
          <SonnerToaster position="top-right" />
        </DashboardProvider>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;
