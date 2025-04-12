import { supabase } from './supabase';

/**
 * Checks if a user is authenticated
 * @returns Promise<boolean> True if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error.message);
      return false;
    }
    
    return !!data.session;
  } catch (error) {
    console.error('Authentication check error:', error);
    return false;
  }
}

/**
 * Gets the current user data
 * @returns Promise<any> The user data or null
 */
export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Get user error:', error.message);
      return null;
    }
    
    return data.user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Signs out the current user
 * @returns Promise<boolean> True if sign out was successful
 */
export async function signOut(): Promise<boolean> {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('Sign out error:', error.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Sign out exception:', error);
    return false;
  }
}

/**
 * Checks if a user's email is verified by attempting a passwordless sign-in
 * @param email The email to check
 * @returns Promise<{ isVerified: boolean, message: string }> 
 */
export async function isEmailVerified(email: string): Promise<{ isVerified: boolean, message: string }> {
  if (!email) {
    return { isVerified: false, message: 'No email provided' };
  }
  
  try {
    // Try to get user by email first (admin API would be better, but this is client-side)
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create a user if they don't exist
      }
    });

    if (error) {
      if (error.message.includes('Email not confirmed')) {
        return { isVerified: false, message: 'Email is not verified' };
      } else if (error.message.includes('does not exist')) {
        return { isVerified: false, message: 'User does not exist' };
      }
      
      console.error('Email verification check error:', error.message);
      return { isVerified: false, message: error.message };
    }
    
    return { isVerified: true, message: 'Email is verified' };
  } catch (error) {
    console.error('Email verification check exception:', error);
    return { isVerified: false, message: 'Error checking email verification status' };
  }
} 