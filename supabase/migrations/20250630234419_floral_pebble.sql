/*
  # Create users table for wallet application

  1. New Tables
    - `users`
      - `id` (uuid, primary key) - matches Supabase auth user ID
      - `email` (text, unique) - user's email address
      - `full_name` (text) - user's full name
      - `phone` (text) - user's phone number
      - `balance` (numeric) - wallet balance in GHS
      - `created_at` (timestamp) - account creation time
      - `updated_at` (timestamp) - last update time

  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read/update their own data
    - Add policy for users to insert their own profile during signup
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  balance numeric(12,2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for users to update their own data
CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_phone_idx ON users(phone);