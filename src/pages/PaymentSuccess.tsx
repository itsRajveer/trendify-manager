
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      toast.success('Payment successful! Your balance has been updated.');
      
      // Navigate back to dashboard after a short delay
      const timer = setTimeout(() => {
        navigate('/');
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      navigate('/');
    }
  }, [navigate, searchParams]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md w-full p-8 bg-card rounded-lg shadow-lg text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-8 w-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your account balance has been updated successfully.
        </p>
        <p className="text-sm text-muted-foreground">
          Redirecting you to the dashboard...
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
