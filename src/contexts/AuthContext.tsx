import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateUserBalance: (newBalance: number) => void;
  addToBalance: (amount: number) => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for saved token and user in localStorage
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      // Set up axios default headers for all requests
      axios.defaults.headers.common['Authorization'] = token;
      setUser(JSON.parse(savedUser));
    }
    
    setIsLoading(false);
  }, []);

  const updateUserBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = {
        ...user,
        balance: parseFloat(newBalance.toFixed(2))
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };
  
  const addToBalance = (amount: number) => {
    if (user) {
      const newBalance = user.balance + amount;
      updateUserBalance(newBalance);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.token) {
        // Format user data from Firebase Auth response
        const userData: User = {
          id: response.data.user.uid,
          name: response.data.user.displayName || 'User',
          email: response.data.user.email,
          balance: response.data.user.balance || 10000,
        };
        
        setUser(userData);
        
        // Save token and user data to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set token for future API requests
        axios.defaults.headers.common['Authorization'] = response.data.token;
        
        toast.success('Successfully logged in');
      }
    } catch (error) {
      toast.error('Login failed: ' + (error instanceof Error ? error.message : 'Invalid credentials'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, { name, email, password });
      
      if (response.data.token) {
        // Format user data from Firebase Auth response
        const userData: User = {
          id: response.data.user.uid,
          name: response.data.user.displayName || name,
          email: response.data.user.email,
          balance: 10000, // Starting balance
        };
        
        setUser(userData);
        
        // Save token and user data to localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Set token for future API requests
        axios.defaults.headers.common['Authorization'] = response.data.token;
        
        toast.success('Account created successfully');
      }
    } catch (error) {
      toast.error('Signup failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear user data and token
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        updateUserBalance,
        addToBalance,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
