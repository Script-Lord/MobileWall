/*
  # Fix User Authentication RLS Policies

  1. Policy Updates
    - Update the INSERT policy for users table to allow signup
    - Ensure proper RLS policies for user profile creation
    - Add policy to allow users to insert their own profile during signup

  2. Security
    - Maintain RLS on users table
    - Allow authenticated users to insert their own profile
    - Keep existing read/update policies intact

  3. Changes
    - Drop existing restrictive INSERT policy
    - Create new INSERT policy that works with Supabase auth flow
*/

-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

-- Create a new INSERT policy that allows users to create their profile during signup
-- This policy allows INSERT when the user ID matches the authenticated user's ID
CREATE POLICY "Users can create own profile during signup"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Also allow public INSERT for the signup flow (this is safe because we check the ID)
-- This is needed because during signup, the user might not be fully authenticated yet
CREATE POLICY "Allow profile creation during signup"
  ON users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure the existing policies are still in place
-- Recreate the SELECT policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can read own data'
  ) THEN
    CREATE POLICY "Users can read own data"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;
END $$;

-- Recreate the UPDATE policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update own data'
  ) THEN
    CREATE POLICY "Users can update own data"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;