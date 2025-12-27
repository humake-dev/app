// UserContext.tsx
import React, { createContext, useContext, ReactNode } from 'react';

interface UserContextType {
  user: any | null;
  setUser: (user: any) => void;
  setIsLoggedIn?: (isLoggedIn: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode; value: UserContextType }> = ({ children, value }) => {
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;