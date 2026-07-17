import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginUser, registerUser, logoutUser, getMe } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check auth session status on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await getMe();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        // silent fail on mount (means no cookie / unauthorized)
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    setLoading(true);
    try {
      const response = await loginUser(credentials);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return response;
      }
      throw new Error(response.message || 'Login failed.');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      const response = await registerUser(userData);
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        return response;
      }
      throw new Error(response.message || 'Registration failed.');
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
