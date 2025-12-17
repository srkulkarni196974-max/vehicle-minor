import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import axios from 'axios';
import { API_URL } from '../config';
import { auth } from '../config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken,
  signInWithPopup,
  sendPasswordResetEmail,
  EmailAuthProvider,
  linkWithCredential,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { GoogleAuth } from '@codetrix-studio/capacitor-google-auth';

// Configure axios defaults
axios.defaults.baseURL = `${API_URL}/api`;
axios.defaults.withCredentials = true;
axios.defaults.timeout = 60000;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (role?: User['role']) => Promise<void>;
  register: (email: string, password: string, name: string, role: User['role']) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  apiLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiLoading, setApiLoading] = useState(false);

  // Sync Firebase user with Backend
  const syncUserWithBackend = async (firebaseUser: FirebaseUser, name?: string, role?: string) => {
    try {
      const token = await getIdToken(firebaseUser);

      // Set token for future requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);

      // Sync with backend
      const res = await axios.post('/auth/sync-user', {
        email: firebaseUser.email,
        name: name || firebaseUser.displayName || 'User',
        role: role, // Only needed for registration
        firebaseUid: firebaseUser.uid
      });

      const backendUser = res.data.user;
      setUser(backendUser);
      localStorage.setItem('user', JSON.stringify(backendUser));

      if (backendUser.assignedVehicleId) {
        localStorage.setItem('assignedVehicleId', backendUser.assignedVehicleId);
      }

    } catch (error) {
      console.error('Failed to sync user with backend:', error);
      // Force logout if sync fails (e.g., user deleted in backend)
      await signOut(auth);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        try {
          // If we already have user data in local storage, use it temporarily while we re-sync
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }

          // Always refresh token and sync on load
          await syncUserWithBackend(firebaseUser);
        } catch (error) {
          console.error('Auth state sync error:', error);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('assignedVehicleId');
        delete axios.defaults.headers.common['Authorization'];
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setApiLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // syncUserWithBackend is handled by onAuthStateChanged, but we can await it here if we want to block
      // However, onAuthStateChanged triggers automatically. 
      // To ensure we have the backend user before resolving, we can manually call sync here.
      await syncUserWithBackend(userCredential.user);
    } catch (error: any) {
      console.error('Login error:', error);
      let message = 'Login failed';
      if (error.code === 'auth/user-not-found') message = 'User not found';
      if (error.code === 'auth/wrong-password') message = 'Invalid password';
      if (error.code === 'auth/invalid-credential') message = 'Invalid credentials';
      throw new Error(message);
    } finally {
      setApiLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role: User['role']) => {
    setApiLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Pass name and role to sync function for initial creation
      await syncUserWithBackend(userCredential.user, name, role);
    } catch (error: any) {
      console.error('Registration error:', error);
      let message = 'Registration failed';

      // Handle email-already-in-use by linking credentials
      if (error.code === 'auth/email-already-in-use') {
        try {
          // Current user might be signed in via Google
          const currentUser = auth.currentUser;
          if (currentUser && currentUser.email === email) {
            // Link password credential to existing account
            const credential = EmailAuthProvider.credential(email, password);
            await linkWithCredential(currentUser, credential);

            // Update backend with name and role
            await syncUserWithBackend(currentUser, name, role);
            return; // Success!
          } else {
            // User exists in Firebase but not currently signed in
            message = 'This email is already registered. Please sign in with Google first, then you can add a password to your account.';
          }
        } catch (linkError: any) {
          console.error('Linking error:', linkError);
          message = 'Email already in use. Please sign in with Google to access your account.';
        }
      } else if (error.code === 'auth/weak-password') {
        message = 'Password is too weak (minimum 6 characters required)';
      }

      throw new Error(message);
    } finally {
      setApiLoading(false);
    }
  };

  const loginWithGoogle = async (role: User['role'] = 'personal') => {
    setApiLoading(true);
    try {
      let user;

      // Check if running on native mobile (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        try {
          // Native Google Sign-In
          const googleUser = await GoogleAuth.signIn();
          const credential = GoogleAuthProvider.credential(googleUser.authentication.idToken);
          const userCredential = await signInWithCredential(auth, credential);
          user = userCredential.user;
        } catch (error: any) {
          // Handle native sign-in error specifically or fallback
          console.error('Native Google Sign-in failed', error);
          throw error;
        }
      } else {
        // Web Google Sign-In (Popup)
        const provider = new GoogleAuthProvider();
        const userCredential = await signInWithPopup(auth, provider);
        user = userCredential.user;
      }

      // Check if user exists in backend, if not create with provided role
      const displayName = user.displayName || 'User';
      await syncUserWithBackend(user, displayName, role);

    } catch (error: any) {
      console.error('Google Sign-In error:', error);
      let message = 'Google Sign-In failed';
      if (error.code === 'auth/popup-closed-by-user') message = 'Sign-in cancelled';
      if (error.code === 'auth/popup-blocked') message = 'Popup blocked by browser';
      // Native auth errors usually come as objects, handle them
      if (error.message) message = error.message;

      throw new Error(message);
    } finally {
      setApiLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setApiLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Password Reset error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    } finally {
      setApiLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await GoogleAuth.signOut();
      }
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, resetPassword, logout, loading, apiLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}