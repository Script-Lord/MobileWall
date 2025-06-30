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
  Smartphone,
  Shield,
  CreditCard
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  provider: string;
  phone: string;
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  reference: string;
}

interface User {
  name: string;
  phone: string;
  balance: number;
}

const PROVIDERS = [
  { id: 'mtn', name: 'MTN Mobile Money', color: 'bg-yellow-500', logo: '📱' },
  { id: 'airtel', name: 'AirtelTigo Money', color: 'bg-red-500', logo: '📲' },
  { id: 'telecel', name: 'Telecel Cash', color: 'bg-blue-500', logo: '💳' },
];

export default function WalletApp() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'deposit' | 'withdraw' | 'history' | 'profile'>('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [user, setUser] = useState<User>({
    name: 'John Doe',
    phone: '+233 24 123 4567',
    balance: 1250.50
  });
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'deposit',
      amount: 500,
      provider: 'MTN Mobile Money',
      phone: '+233 24 123 4567',
      status: 'completed',
      date: new Date('2024-01-15T10:30:00'),
      reference: 'TXN001234567'
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 200,
      provider: 'AirtelTigo Money',
      phone: '+233 26 987 6543',
      status: 'completed',
      date: new Date('2024-01-14T15:45:00'),
      reference: 'TXN001234568'
    },
    {
      id: '3',
      type: 'deposit',
      amount: 1000,
      provider: 'Telecel Cash',
      phone: '+233 20 555 1234',
      status: 'pending',
      date: new Date('2024-01-13T09:15:00'),
      reference: 'TXN001234569'
    }
  ]);

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

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount: parseFloat(depositForm.amount),
      provider: PROVIDERS.find(p => p.id === depositForm.provider)?.name || '',
      phone: depositForm.phone,
      status: 'pending',
      date: new Date(),
      reference: `TXN${Date.now()}`
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setDepositForm({ amount: '', provider: '', phone: '' });
    setCurrentView('dashboard');
    
    // Simulate transaction completion
    setTimeout(() => {
      setTransactions(prev => 
        prev.map(t => 
          t.id === newTransaction.id 
            ? { ...t, status: 'completed' as const }
            : t
        )
      );
      setUser(prev => ({ ...prev, balance: prev.balance + parseFloat(depositForm.amount) }));
    }, 3000);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawForm.amount);
    
    if (amount > user.balance) {
      alert('Insufficient balance');
      return;
    }

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount: amount,
      provider: PROVIDERS.find(p => p.id === withdrawForm.provider)?.name || '',
      phone: withdrawForm.phone,
      status: 'pending',
      date: new Date(),
      reference: `TXN${Date.now()}`
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
    setWithdrawForm({ amount: '', provider: '', phone: '' });
    setCurrentView('dashboard');
    
    // Simulate transaction completion
    setTimeout(() => {
      setTransactions(prev => 
        prev.map(t => 
          t.id === newTransaction.id 
            ? { ...t, status: 'completed' as const }
            : t
        )
      );
      setUser(prev => ({ ...prev, balance: prev.balance - amount }));
    }, 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-50';
      case 'pending': return 'text-warning-600 bg-warning-50';
      case 'failed': return 'text-error-600 bg-error-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

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
          disabled={!depositForm.amount || !depositForm.provider || !depositForm.phone}
          className="w-full bg-success-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-success-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Deposit {depositForm.amount && formatCurrency(parseFloat(depositForm.amount))}
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
          disabled={!withdrawForm.amount || !withdrawForm.provider || !withdrawForm.phone}
          className="w-full bg-primary-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Withdraw {withdrawForm.amount && formatCurrency(parseFloat(withdrawForm.amount))}
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
                <span>{formatDate(transaction.date)}</span>
              </div>
              <div className="col-span-2">
                <span className="block font-medium">Reference</span>
                <span className="font-mono text-xs">{transaction.reference}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-10 h-10 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
        <p className="text-gray-600">{user.phone}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Full Name</span>
              <span className="font-medium text-gray-900">{user.name}</span>
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
                <span className="text-gray-700">Two-Factor Authentication</span>
              </div>
              <span className="text-success-600 text-sm font-medium">Enabled</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-success-600" />
                <span className="text-gray-700">PIN Protection</span>
              </div>
              <span className="text-success-600 text-sm font-medium">Active</span>
            </div>
          </div>
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