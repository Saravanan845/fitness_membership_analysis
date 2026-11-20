import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('fittrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('fittrack_token');
      const storedUser = localStorage.getItem('fittrack_user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('fittrack_token');
          localStorage.removeItem('fittrack_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const { token: receivedToken, ...userData } = response.data.data;

    localStorage.setItem('fittrack_token', receivedToken);
    localStorage.setItem('fittrack_user', JSON.stringify(userData));

    setToken(receivedToken);
    setUser(userData);
    return response.data;
  };

  const thirdPartyLogin = async (profileData) => {
    const response = await api.post('/auth/oauth-login', profileData);
    const { token: receivedToken, ...userData } = response.data.data;

    localStorage.setItem('fittrack_token', receivedToken);
    localStorage.setItem('fittrack_user', JSON.stringify(userData));

    setToken(receivedToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('fittrack_token');
    localStorage.removeItem('fittrack_user');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        thirdPartyLogin,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
