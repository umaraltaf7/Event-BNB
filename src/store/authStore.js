import { create } from 'zustand';

// Simple localStorage persistence
const loadAuthState = () => {
  if (typeof window === 'undefined') {
    return { user: null, isAuthenticated: false };
  }
  try {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed;
    }
    return { user: null, isAuthenticated: false };
  } catch {
    return { user: null, isAuthenticated: false };
  }
};

const saveAuthState = (state) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('auth-storage', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save auth state:', error);
  }
};

// Initialize state once
const initialState = loadAuthState();

const useAuthStore = create((set) => ({
  user: initialState.user,
  isAuthenticated: initialState.isAuthenticated,
  login: (userData) => {
    const newState = { user: userData, isAuthenticated: true };
    saveAuthState(newState);
    set(newState);
  },
  logout: () => {
    const newState = { user: null, isAuthenticated: false };
    saveAuthState(newState);
    set(newState);
  },
  updateUser: (userData) => {
    set((state) => {
      const newState = { ...state, user: { ...state.user, ...userData } };
      saveAuthState(newState);
      return newState;
    });
  },
}));

export default useAuthStore;

