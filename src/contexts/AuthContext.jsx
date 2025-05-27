// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const AUTH_STORAGE_KEY = 'eduSyncAuthUser'; // Key for localStorage

// 1. Create the Context
const AuthContext = createContext({
  currentUser: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

// 2. Create a custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};

// 3. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true to check localStorage

  // Effect to check for persisted login state from localStorage on initial app load
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser)); // Parse the stored JSON string
      }
    } catch (error) {
      console.error("Failed to parse auth user from localStorage", error);
      // If parsing fails, it's safer to start with no user
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    setIsLoading(false); // Done checking initial state
  }, []); // Empty dependency array ensures this runs only once on mount

  // Login function: updates currentUser and persists to localStorage
  const login = (userData) => {
    if (userData) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      setCurrentUser(userData);
    } else {
      // Handle case where userData might be null/undefined unexpectedly
      console.error("Login function called with invalid userData");
      localStorage.removeItem(AUTH_STORAGE_KEY); // Ensure inconsistent state is cleared
      setCurrentUser(null);
    }
  };

  // Logout function: clears currentUser and removes from localStorage
  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
