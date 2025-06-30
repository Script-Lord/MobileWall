/*
  # Create transactions table for wallet operations

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key) - unique transaction ID
      - `user_id` (uuid, foreign key) - references users table
      - `type` (text) - 'deposit' or 'withdrawal'
      - `amount` (numeric) - transaction amount in GHS
      - `provider` (text) - mobile money provider name
      - `phone` (text) - phone number used for transaction
      - `status` (text) - 'pending', 'completed', or 'failed'
      - `reference` (text, unique) - transaction reference number
      - `created_at` (timestamp) - transaction creation time
      - `updated_at` (timestamp) - last update time

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to read their own transactions
    - Add policy for authenticated users to create transactions
    - Add policy for system to update transaction status

  3. Constraints
    - Check constraint for valid transaction types
    - Check constraint for valid status values
    - Check constraint for positive amounts
*/

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
  amount numeric(12,2) NOT NULL CHECK (amount > 0),
  provider text NOT NULL,
  phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  reference text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own transactions
CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to create their own transactions
CREATE POLICY "Users can create own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for system to update transaction status (service role)
CREATE POLICY "System can update transaction status"
  ON transactions
  FOR UPDATE
  TO service_role
  USING (true);

-- Policy for authenticated users to update their own transactions
CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS transactions_reference_idx ON transactions(reference);