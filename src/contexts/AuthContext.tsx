import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { auth, googleProvider, facebookProvider } from "../firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  abhaId?: string;
  emergencyContacts?: EmergencyContact[];
}

interface AuthContextType {
  user: UserProfile | null;
  login: (name: string, email: string) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setUser({
          id: fbUser.uid,
          name: fbUser.displayName || "User",
          email: fbUser.email || "",
          emergencyContacts: user?.emergencyContacts || [] // Ideally fetch from firestore
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setShowAuthModal(false);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Failed to sign in"));
    }
  };

  const loginWithFacebook = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
      setShowAuthModal(false);
    } catch (error) {
      console.error("Error signing in with Facebook:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Failed to sign in"));
    }
  };

  const login = (name: string, email: string) => {
    // This is the fallback for classic username login without actual Firebase password auth set up here.
    setUser({ id: Math.random().toString(), name, email, emergencyContacts: [] });
    setShowAuthModal(false);
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
       console.error("Error signing out:", error);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      setUser({ ...user, ...updates });
      // Ideally save this to firestore here!
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, loginWithFacebook, logout, updateProfile, showAuthModal, setShowAuthModal, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
