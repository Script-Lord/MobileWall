import { connect } from '@planetscale/database';

const config = {
  host: import.meta.env.VITE_DATABASE_HOST,
  username: import.meta.env.VITE_DATABASE_USERNAME,
  password: import.meta.env.VITE_DATABASE_PASSWORD,
};

if (!config.host || !config.username || !config.password) {
  throw new Error('Missing PlanetScale database environment variables');
}

export const db = connect(config);

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  balance: number;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  provider: string;
  phone: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  created_at: Date;
  updated_at: Date;
}