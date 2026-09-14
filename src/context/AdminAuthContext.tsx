import React, { createContext, useContext, useState, useEffect } from 'react';

export const ADMIN_PASSWORD = "Ayan@2024";
const STORAGE_KEY = "11star_admin_logged_in_session";

interface AdminAuthContextType {
  isAdminLoggedIn: boolean;
  loginAdmin: (password: string) => boolean;
  verifyPassword: (password: string) => boolean;
  logoutAdmin: () => void;
  isAdminLoginModalOpen: boolean;
  openAdminLoginModal: () => void;
  closeAdminLoginModal: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const AdminAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [isAdminLoginModalOpen, setIsAdminLoginModalOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        setIsAdminLoggedIn(sessionStorage.getItem(STORAGE_KEY) === 'true');
      } catch {
        setIsAdminLoggedIn(false);
      }
    };
    window.addEventListener('club_admin_auth_changed', handleStorageChange);
    return () => window.removeEventListener('club_admin_auth_changed', handleStorageChange);
  }, []);

  const verifyPassword = (password: string): boolean => {
    return password.trim() === ADMIN_PASSWORD;
  };

  const loginAdmin = (password: string): boolean => {
    if (password.trim() === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, 'true');
      } catch (e) {
        console.warn('Failed to set admin session:', e);
      }
      window.dispatchEvent(new Event('club_admin_auth_changed'));
      setIsAdminLoginModalOpen(false);
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove admin session:', e);
    }
    window.dispatchEvent(new Event('club_admin_auth_changed'));
  };

  const openAdminLoginModal = () => setIsAdminLoginModalOpen(true);
  const closeAdminLoginModal = () => setIsAdminLoginModalOpen(false);

  return (
    <AdminAuthContext.Provider
      value={{
        isAdminLoggedIn,
        loginAdmin,
        verifyPassword,
        logoutAdmin,
        isAdminLoginModalOpen,
        openAdminLoginModal,
        closeAdminLoginModal
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
