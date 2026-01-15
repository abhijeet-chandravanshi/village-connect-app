import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button } from '../components/ui';
import { 
  ArrowLeft,
  IndianRupee, 
  TrendingUp, 
  TrendingDown,
  Users,
  Calendar,
  PieChart,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data/mockData';
import { festivalService, contributionService, expenseService } from '../services';

function Transparency() {
  const { festivalId } = useParams();
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [festival, setFestival] = useState(null);
  const [relevantContributions, setRelevantContributions] = useState([]);
  const [relevantExpenses, setRelevantExpenses] = useState([]);
  const [expenseByCategory, setExpenseByCategory] = useState({});

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useBackend) {
          // Fetch festival if festivalId provided
          if (festivalId) {
            const festivalData = await festivalService.getById(festivalId);
            setFestival(festivalData);
            
            // Fetch contributions for this festival
            const contribData = await contributionService.getVerified(festivalId);
            setRelevantContributions(contribData || []);
            
            // Fetch expenses for this festival
            const expenseData = await expenseService.getByFestival(festivalId);
            setRelevantExpenses(expenseData || []);
            
            // Get expense breakdown
            const breakdown = await expenseService.getBreakdownByFestival(festivalId);
            setExpenseByCategory(breakdown || {});
          } else {
            // Fetch all data
            const contribData = await contributionService.getRecent();
            setRelevantContributions((contribData || []).filter(c => c.status === 'VERIFIED' || c.status === 'verified'));
            
            const expenseData = await expenseService.getAll();
            setRelevantExpenses(expenseData || []);
            
            // Calculate category breakdown from all expenses
            const breakdown = (expenseData || []).reduce((acc, e) => {
              const category = e.category || 'Other';
              acc[category] = (acc[category] || 0) + parseFloat(e.amount || 0);
              return acc;
            }, {});
            setExpenseByCategory(breakdown);
          }
        } else {
          // Fallback to mock data
          const mockData = await import('../data/mockData');
          
          const festivalData = festivalId 
            ? mockData.festivals.find(f => f.id === festivalId) 
            : null;
          setFestival(festivalData);
          
          const contribData = festivalId 
            ? mockData.contributions.filter(c => c.festivalId === festivalId && c.status === 'verified')
            : mockData.contributions.filter(c => c.status === 'verified');
          setRelevantContributions(contribData);
          
          const expenseData = festivalId 
            ? mockData.expenses.filter(e => e.festivalId === festivalId)
            : mockData.expenses;
          setRelevantExpenses(expenseData);
          
          // Calculate category breakdown
          const breakdown = expenseData.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + e.amount;
            return acc;
          }, {});
          setExpenseByCategory(breakdown);
        }
      } catch (error) {
        console.error('Error fetching transparency data:', error);
        // Fallback to mock data on error
        const mockData = await import('../data/mockData');
        
        const festivalData = festivalId 
          ? mockData.festivals.find(f => f.id === festivalId) 
          : null;
        setFestival(festivalData);
        
        const contribData = festivalId 
          ? mockData.contributions.filter(c => c.festivalId === festivalId && c.status === 'verified')
          : mockData.contributions.filter(c => c.status === 'verified');
        setRelevantContributions(contribData);
        
        const expenseData = festivalId 
          ? mockData.expenses.filter(e => e.festivalId === festivalId)
          : mockData.expenses;
        setRelevantExpenses(expenseData);
        
        const breakdown = expenseData.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount;
          return acc;
        }, {});
        setExpenseByCategory(breakdown);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [festivalId, useBackend]);

  // Calculate totals
  const totalCollection = relevantContributions.reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);
  const totalExpense = relevantExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
  const balance = totalCollection - totalExpense;

  // Top contributors
  const contributorTotals = relevantContributions.reduce((acc, c) => {
    const key = c.userId || c.id;
    if (!acc[key]) {
      acc[key] = { 
        name: c.userName || c.userNameEn || 'Unknown', 
        nameEn: c.userNameEn || c.userName || 'Unknown', 
        amount: 0 
      };
    }
    acc[key].amount += parseFloat(c.amount || 0);
    return acc;
  }, {});

  const topContributors = Object.values(contributorTotals)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Loading state
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
        <p className="text-earth-500 dark:text-earth-400 mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <Link 
        to={festivalId ? `/festivals/${festivalId}` : '/festivals'}
        className="inline-flex items-center gap-2 text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('common.back')}</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
          {t('transparency.title')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {festival 
            ? (language === 'en' ? festival.nameEn : festival.name) 
            : t('transparency.allFestivalsReport')}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-leaf-100 dark:bg-leaf-900/40 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-leaf-600 dark:text-leaf-400" />
            </div>
            <p className="text-2xl font-bold text-leaf-600 dark:text-leaf-400">
              {formatCurrency(totalCollection)}
            </p>
            <p className="text-sm text-earth-500 dark:text-earth-400">{t('festivals.collection')}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-saffron-100 dark:bg-saffron-900/40 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-saffron-600 dark:text-saffron-400" />
            </div>
            <p className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">
              {formatCurrency(totalExpense)}
            </p>
            <p className="text-sm text-earth-500 dark:text-earth-400">{t('festivals.expense')}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4 text-center">
            <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center ${
              balance >= 0 
                ? 'bg-primary-100 dark:bg-primary-900/40' 
                : 'bg-red-100 dark:bg-red-900/40'
            }`}>
              <IndianRupee className={`w-6 h-6 ${
                balance >= 0 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
            </div>
            <p className={`text-2xl font-bold ${
              balance >= 0 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(balance)}
            </p>
            <p className="text-sm text-earth-500 dark:text-earth-400">{t('festivals.balance')}</p>
          </div>
        </Card>
      </div>

      {/* Progress Bar */}
      {festival && (
        <Card className="mb-6">
          <div className="p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-earth-500 dark:text-earth-400">{t('festivals.collectionProgress')}</span>
              <span className="font-semibold text-earth-900 dark:text-cream-100">
                {formatCurrency(totalCollection)} / {formatCurrency(festival.expectedBudget)}
              </span>
            </div>
            <div className="h-4 bg-cream-200 dark:bg-earth-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-saffron-500 rounded-full transition-all"
                style={{ width: `${Math.min((totalCollection / festival.expectedBudget) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-earth-500 dark:text-earth-400 mt-2">
              {Math.round((totalCollection / festival.expectedBudget) * 100)}% {t('transparency.ofTarget')}
            </p>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex border-b border-cream-200 dark:border-earth-700 mb-6 overflow-x-auto">
        {['overview', 'contributions', 'expenses'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                : 'text-earth-500 dark:text-earth-400 hover:text-earth-700 dark:hover:text-earth-300'
            }`}
          >
            {tab === 'overview' && (language === 'hi' ? 'अवलोकन' : 'Overview')}
            {tab === 'contributions' && (language === 'hi' ? 'योगदान' : 'Contributions')}
            {tab === 'expenses' && (language === 'hi' ? 'खर्च' : 'Expenses')}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Contributors */}
          <Card>
            <div className="p-4 border-b border-cream-100 dark:border-earth-700">
              <h3 className="font-semibold text-earth-900 dark:text-cream-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-500" />
                {t('transparency.topContributors')}
              </h3>
            </div>
            <div className="divide-y divide-cream-100 dark:divide-earth-700">
              {topContributors.map((contrib, idx) => {
                const displayName = language === 'en' ? (contrib.nameEn || contrib.name) : contrib.name;
                return (
                  <div key={idx} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-earth-900 dark:text-cream-100">
                        {displayName}
                      </span>
                    </div>
                    <span className="font-semibold text-leaf-600 dark:text-leaf-400">
                      {formatCurrency(contrib.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <div className="p-4 border-b border-cream-100 dark:border-earth-700">
              <h3 className="font-semibold text-earth-900 dark:text-cream-100 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-saffron-500" />
                {t('transparency.expenseBreakdown')}
              </h3>
            </div>
            <div className="divide-y divide-cream-100 dark:divide-earth-700">
              {Object.entries(expenseByCategory).map(([category, amount]) => (
                <div key={category} className="p-4 flex items-center justify-between">
                  <span className="text-earth-700 dark:text-earth-300">{category}</span>
                  <span className="font-semibold text-saffron-600 dark:text-saffron-400">
                    {formatCurrency(amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Contributions Tab */}
      {activeTab === 'contributions' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 dark:bg-earth-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {t('common.contributor')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {t('common.amount')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {t('common.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-earth-700">
                {relevantContributions.map((contrib) => {
                  const displayName = language === 'en' ? (contrib.userNameEn || contrib.userName) : contrib.userName;
                  return (
                    <tr key={contrib.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold text-sm">
                            {displayName[0]}
                          </div>
                          <span className="text-earth-900 dark:text-cream-100">{displayName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-leaf-600 dark:text-leaf-400">
                        {formatCurrency(contrib.amount)}
                      </td>
                      <td className="px-4 py-3 text-earth-500 dark:text-earth-400">
                        {formatDate(contrib.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 dark:bg-earth-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {t('admin.description')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {language === 'hi' ? 'श्रेणी' : 'Category'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {t('common.amount')}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {t('common.date')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-earth-700">
                {relevantExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-3">
                      <p className="text-earth-900 dark:text-cream-100">{expense.description}</p>
                      <p className="text-sm text-earth-500 dark:text-earth-400">{expense.paidTo}</p>
                    </td>
                    <td className="px-4 py-3 text-earth-600 dark:text-earth-400">
                      {expense.category}
                    </td>
                    <td className="px-4 py-3 font-semibold text-saffron-600 dark:text-saffron-400">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-earth-500 dark:text-earth-400">
                      {formatDate(expense.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Transparency;
