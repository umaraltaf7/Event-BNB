import { create } from 'zustand';
import { supabase } from '../lib/supabase';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  loading: true, // Start with loading true

  // Fetch profile from database
  fetchProfile: async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({ profile: null });
    }
  },

  // Initialize auth state
  initializeAuth: async () => {
    set({ loading: true });

    // Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      set({ user: session.user, isAuthenticated: true });
      await get().fetchProfile(session.user.id);
    } else {
      set({ user: null, profile: null, isAuthenticated: false });
    }
    set({ loading: false });

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        set({ user: session.user, isAuthenticated: true, loading: true });
        await get().fetchProfile(session.user.id);
        set({ loading: false });
      } else {
        set({ user: null, profile: null, isAuthenticated: false, loading: false });
      }
    });
  },

  // Sign in
  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ user: data.user, isAuthenticated: true });
      await get().fetchProfile(data.user.id);
      set({ loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign up
  signUp: async (email, password, name, role = 'user') => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role, // This goes to user_metadata
          },
        },
      });
      if (error) throw error;
      // Profile will be created by trigger, and fetched by onAuthStateChange
      return { success: true, requiresEmailConfirmation: !data.session };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.message };
    }
  },

  // Sign out
  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      // State will be cleared by onAuthStateChange
    } catch (error) {
      console.error('Sign out error:', error);
      // Even if sign out fails, clear the state to log out on frontend
      set({ user: null, profile: null, isAuthenticated: false, loading: false });
    }
  },

  // Update profile
  updateProfile: async (updates) => {
    try {
      const user = get().user;
      if (!user) throw new Error('No user');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ profile: data });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },
}));

export default useAuthStore;

