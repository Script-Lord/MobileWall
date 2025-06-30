import { supabase } from './supabase';
import type { Database } from './database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export const transactionService = {
  async createTransaction(transaction: Omit<TransactionInsert, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        ...transaction,
        reference: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateTransactionStatus(transactionId: string, status: 'completed' | 'failed') {
    const { error } = await supabase
      .from('transactions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', transactionId);

    if (error) throw error;
  },

  async updateUserBalance(userId: string, amount: number, type: 'deposit' | 'withdrawal') {
    // Get current balance
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', userId)
      .single();

    if (userError) throw userError;

    const newBalance = type === 'deposit' 
      ? user.balance + amount 
      : user.balance - amount;

    if (newBalance < 0) {
      throw new Error('Insufficient balance');
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
    return newBalance;
  }
};