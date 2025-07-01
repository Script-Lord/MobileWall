import { db } from './database';
import type { Transaction } from './database';

export const transactionService = {
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const transactionId = crypto.randomUUID();
      const reference = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      await db.execute(
        `INSERT INTO transactions (id, user_id, type, amount, provider, phone, status, reference, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          transactionId,
          transaction.user_id,
          transaction.type,
          transaction.amount,
          transaction.provider,
          transaction.phone,
          transaction.status || 'pending',
          reference
        ]
      );

      // Fetch the created transaction
      const result = await db.execute(
        'SELECT * FROM transactions WHERE id = ?',
        [transactionId]
      );

      return result.rows[0] as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async getUserTransactions(userId: string): Promise<Transaction[]> {
    try {
      const result = await db.execute(
        'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      return result.rows as Transaction[];
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async updateTransactionStatus(transactionId: string, status: 'completed' | 'failed') {
    try {
      await db.execute(
        'UPDATE transactions SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, transactionId]
      );
    } catch (error) {
      console.error('Error updating transaction status:', error);
      throw error;
    }
  },

  async updateUserBalance(userId: string, amount: number, type: 'deposit' | 'withdrawal') {
    try {
      // Get current balance
      const userResult = await db.execute(
        'SELECT balance FROM users WHERE id = ?',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new Error('User not found');
      }

      const currentBalance = Number(userResult.rows[0].balance);
      const newBalance = type === 'deposit' 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (newBalance < 0) {
        throw new Error('Insufficient balance');
      }

      await db.execute(
        'UPDATE users SET balance = ?, updated_at = NOW() WHERE id = ?',
        [newBalance, userId]
      );

      return newBalance;
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  }
};