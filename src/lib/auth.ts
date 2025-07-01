import { db } from './database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from './database';

const JWT_SECRET = import.meta.env.VITE_JWT_SECRET || 'your-secret-key-change-in-production';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  balance: number;
}

export interface AuthUser {
  id: string;
  email: string;
}

// Simple in-memory session storage for demo purposes
// In production, use proper session management
let currentUser: AuthUser | null = null;
let authStateListeners: ((user: AuthUser | null) => void)[] = [];

const notifyAuthStateChange = (user: AuthUser | null) => {
  currentUser = user;
  authStateListeners.forEach(listener => listener(user));
};

export const authService = {
  async signUp(email: string, password: string, fullName: string, phone: string) {
    try {
      // Check if user already exists
      const existingUser = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();

      // Create user
      await db.execute(
        `INSERT INTO users (id, email, full_name, phone, password_hash, balance, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, 0.00, NOW(), NOW())`,
        [userId, email, fullName, phone, passwordHash]
      );

      const user: AuthUser = { id: userId, email };
      notifyAuthStateChange(user);

      return { user };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

  async signIn(email: string, password: string) {
    try {
      const result = await db.execute(
        'SELECT id, email, password_hash FROM users WHERE email = ?',
        [email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid login credentials');
      }

      const user = result.rows[0] as any;
      const isValidPassword = await bcrypt.compare(password, user.password_hash);

      if (!isValidPassword) {
        throw new Error('Invalid login credentials');
      }

      const authUser: AuthUser = { id: user.id, email: user.email };
      notifyAuthStateChange(authUser);

      return { user: authUser };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  async signOut() {
    notifyAuthStateChange(null);
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    return currentUser;
  },

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const result = await db.execute(
        'SELECT id, email, full_name, phone, balance FROM users WHERE id = ?',
        [userId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0] as UserProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    authStateListeners.push(callback);
    
    // Return unsubscribe function
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authStateListeners.indexOf(callback);
            if (index > -1) {
              authStateListeners.splice(index, 1);
            }
          }
        }
      }
    };
  }
};