import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Minus, 
  History, 
  User, 
  Eye, 
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  CreditCard,
  LogOut,
  Loader2
} from 'lucide-react';
import { authService, type UserProfile } from '../lib/auth';
import { transactionService } from '../lib/transactions';
import type { Database } from '../lib/database.types';

type Transaction = Database['public']['Tables']['transactions']['Row'];

const PROVIDERS = [
  { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-500', logo: '📱' },
  { id: 'airtel', name: 'AirtelTigo Money', color: 'bg-red-500', logo: '📲' },
  { id: 'telecel', name: 'Telecel Cash', color: 'bg-blue-500', logo: '💳' },
];

interface WalletAppProps {
  onSignOut: () => void;
}

export default function WalletApp({ onSignOut }: WalletAppProps) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'deposit' | 'withdraw' | 'history' | 'profile'>('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [depositForm, setDepositForm] = useState({
    amount: '',
    provider: '',
    phone: ''
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    provider: '',
    phone: ''
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        const profile = await authService.getUserProfile(currentUser.id);
        const userTransactions = await transactionService.getUserTransactions(currentUser.id);
        
        setUser(profile);
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setActionLoading(true);
    try {
      const provider = PROVIDERS.find(p => p.id === depositForm.provider);
      const transaction = await transactionService.createTransaction({
        user_id: user.id,
        type: 'deposit',
        amount: parseFloat(depositForm.amount),
        provider: provider?.name || '',
        phone: depositForm.phone,
        status: 'pending'
      });

      // Simulate processing time
      setTimeout(async () => {
        try {
          await transactionService.updateTransactionStatus(transaction.id, 'completed');
          const newBalance = await transactionService.updateUserBalance(
            user.id, 
            parseFloat(depositForm.amount), 
            'deposit'
          );
          
          setUser(prev => prev ? { ...prev, balance: newBalance } : null);
          await loadUserData(); // Refresh transactions
        } catch (error) {
          await transactionService.updateTransactionStatus(transaction.id, 'failed');
          console.error('Transaction failed:', error);
        }
      }, 3000);

      setDepositForm({ amount: '', provider: '', phone: '' });
      setCurrentView('dashboard');
      await loadUserData(); // Refresh to show pending transaction
    } catch (error) {
      console.error('Error creating deposit:', error);
      alert('Failed to create deposit transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const amount = parseFloat(withdrawForm.amount);
    if (amount > user.balance) {
      alert('Insufficient balance');
      return;
    }

    setActionLoading(true);
    try {
      const provider = PROVIDERS.find(p => p.id === withdrawForm.provider);
      const transaction = await transactionService.createTransaction({
        user_id: user.id,
        type: 'withdrawal',
        amount: amount,
        provider: provider?.name || '',
        phone: withdrawForm.phone,
        status: 'pending'
      });

      // Simulate processing time
      setTimeout(async () => {
        try {
          await transactionService.updateTransactionStatus(transaction.id, 'completed');
          const newBalance = await transactionService.updateUserBalance(
            user.id, 
            amount, 
            'withdrawal'
          );
          
          setUser(prev => prev ? { ...prev, balance: newBalance } : null);
          await loadUserData(); // Refresh transactions
        } catch (error) {
          await transactionService.updateTransactionStatus(transaction.id, 'failed');
          console.error('Transaction failed:', error);
        }
      }, 3000);

      setWithdrawForm({ amount: '', provider: '', phone: '' });
      setCurrentView('dashboard');
      await loadUserData(); // Refresh to show pending transaction
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      alert('Failed to create withdrawal transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
      onSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-50';
      case 'pending': return 'text-warning-600 bg-warning-50';
      case 'failed': return 'text-error-600 bg-error-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Error loading user data</p>
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span className="text-primary-100">Wallet Balance</span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 hover:bg-primary-500 rounded-lg transition-colors"
          >
            {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-3xl font-bold">
          {showBalance ? formatCurrency(user.balance) : '••••••'}
        </div>
        <p className="text-primary-200 text-sm mt-1">Available Balance</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => setCurrentView('deposit')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-success-50 rounded-xl mb-4 group-hover:bg-success-100 transition-colors">
            <Plus className="w-6 h-6 text-success-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Deposit</h3>
          <p className="text-sm text-gray-500">Add money to wallet</p>
        </button>

        <button
          onClick={() => setCurrentView('withdraw')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-primary-50 rounded-xl mb-4 group-hover:bg-primary-100 transition-colors">
            <Minus className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Withdraw</h3>
          <p className="text-sm text-gray-500">Send money out</p>
        </button>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
            <button
              onClick={() => setCurrentView('history')}
              className="text-primary-600 text-sm font-medium hover:text-primary-700"
            >
              View All
            </button>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {transactions.slice(0, 3).map((transaction) => (
            <div key={transaction.id} className="p-6 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  transaction.type === 'deposit' ? 'bg-success-50' : 'bg-primary-50'
                }`}>
                  {transaction.type === 'deposit' ? 
                    <ArrowDownLeft className="w-5 h-5 text-success-600" /> :
                    <ArrowUpRight className="w-5 h-5 text-primary-600" />
                  }
                </div>
                <div>
                  <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                  <p className="text-sm text-gray-500">{transaction.provider}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  transaction.type === 'deposit' ? 'text-success-600' : 'text-gray-900'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDeposit = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-success-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Deposit Money</h2>
        <p className="text-gray-600">Add money to your wallet from mobile money</p>
      </div>

      <form onSubmit={handleDeposit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (GHS)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            required
            value={depositForm.amount}
            onChange={(e) => setDepositForm(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Money Provider</label>
          <div className="space-y-3">
            {PROVIDERS.map((provider) => (
              <label key={provider.id} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value={provider.id}
                  checked={depositForm.provider === provider.id}
                  onChange={(e) => setDepositForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  depositForm.provider === provider.id 
                    ? 'border-primary-600 bg-primary-600' 
                    : 'border-gray-300'
                }`}>
                  {depositForm.provider === provider.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.logo}</span>
                  <span className="font-medium text-gray-900">{provider.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            required
            value={depositForm.phone}
            onChange={(e) => setDepositForm(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+233 XX XXX XXXX"
          />
        </div>

        <button
          type="submit"
          disabled={!depositForm.amount || !depositForm.provider || !depositForm.phone || actionLoading}
          className="w-full bg-success-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-success-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Deposit ${depositForm.amount ? formatCurrency(parseFloat(depositForm.amount)) : ''}`
          )}
        </button>
      </form>
    </div>
  );

  const renderWithdraw = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Minus className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Withdraw Money</h2>
        <p className="text-gray-600">Send money from your wallet to mobile money</p>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Available Balance</span>
          <span className="font-semibold text-gray-900">{formatCurrency(user.balance)}</span>
        </div>
      </div>

      <form onSubmit={handleWithdraw} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Amount (GHS)</label>
          <input
            type="number"
            step="0.01"
            min="1"
            max={user.balance}
            required
            value={withdrawForm.amount}
            onChange={(e) => setWithdrawForm(prev => ({ ...prev, amount: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter amount"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Money Provider</label>
          <div className="space-y-3">
            {PROVIDERS.map((provider) => (
              <label key={provider.id} className="flex items-center p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="provider"
                  value={provider.id}
                  checked={withdrawForm.provider === provider.id}
                  onChange={(e) => setWithdrawForm(prev => ({ ...prev, provider: e.target.value }))}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  withdrawForm.provider === provider.id 
                    ? 'border-primary-600 bg-primary-600' 
                    : 'border-gray-300'
                }`}>
                  {withdrawForm.provider === provider.id && (
                    <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{provider.logo}</span>
                  <span className="font-medium text-gray-900">{provider.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
          <input
            type="tel"
            required
            value={withdrawForm.phone}
            onChange={(e) => setWithdrawForm(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+233 XX XXX XXXX"
          />
        </div>

        <button
          type="submit"
          disabled={!withdrawForm.amount || !withdrawForm.provider || !withdrawForm.phone || actionLoading}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {actionLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Withdraw ${withdrawForm.amount ? formatCurrency(parseFloat(withdrawForm.amount)) : ''}`
          )}
        </button>
      </form>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Transaction History</h2>
        <p className="text-gray-600">View all your wallet transactions</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  transaction.type === 'deposit' ? 'bg-success-50' : 'bg-primary-50'
                }`}>
                  {transaction.type === 'deposit' ? 
                    <ArrowDownLeft className="w-6 h-6 text-success-600" /> :
                    <ArrowUpRight className="w-6 h-6 text-primary-600" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-900 capitalize">{transaction.type}</p>
                  <p className="text-sm text-gray-500">{transaction.provider}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-lg ${
                  transaction.type === 'deposit' ? 'text-success-600' : 'text-gray-900'
                }`}>
                  {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="block font-medium">Phone Number</span>
                <span>{transaction.phone}</span>
              </div>
              <div>
                <span className="block font-medium">Date</span>
                <span>{formatDate(transaction.created_at)}</span>
              </div>
              <div className="col-span-2">
                <span className="block font-medium">Reference</span>
                <span className="font-mono text-xs">{transaction.reference}</span>
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            No transactions yet
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.full_name}</h2>
        <p className="text-gray-600">{user.phone}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Full Name</span>
              <span className="font-medium text-gray-900">{user.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone Number</span>
              <span className="font-medium text-gray-900">{user.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Wallet Balance</span>
              <span className="font-medium text-gray-900">{formatCurrency(user.balance)}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-success-600" />
                <span className="text-gray-700">Account Security</span>
              </div>
              <span className="text-success-600 text-sm font-medium">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-success-600" />
                <span className="text-gray-700">Transaction Protection</span>
              </div>
              <span className="text-success-600 text-sm font-medium">Enabled</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-2 bg-error-50 text-error-600 py-3 px-4 rounded-xl font-semibold hover:bg-error-100 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'deposit': return renderDeposit();
      case 'withdraw': return renderWithdraw();
      case 'history': return renderHistory();
      case 'profile': return renderProfile();
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">GhanaPay</h1>
                <p className="text-xs text-gray-500">Mobile Wallet</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full"></div>
              <span className="text-xs text-gray-600">Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-2">
            {[
              { id: 'dashboard', icon: Wallet, label: 'Home' },
              { id: 'deposit', icon: Plus, label: 'Deposit' },
              { id: 'withdraw', icon: Minus, label: 'Withdraw' },
              { id: 'history', icon: History, label: 'History' },
              { id: 'profile', icon: User, label: 'Profile' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  currentView === item.id
                    ? 'text-primary-600 bg-primary-50'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}