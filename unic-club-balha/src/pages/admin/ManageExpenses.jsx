import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Modal } from '../../components/ui';
import { 
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  IndianRupee,
  Calendar,
  Filter,
  Loader2,
  Receipt,
  TrendingDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import { festivalService, expenseService } from '../../services';
import { formatCurrency, formatDate } from '../../data/mockData';

function ManageExpenses() {
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [festivalFilter, setFestivalFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    festivalId: '',
    description: '',
    category: '',
    amount: '',
    paidTo: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receiptUrl: ''
  });

  // Expense categories
  const categories = [
    'Infrastructure',
    'Decoration',
    'Puja Items',
    'Food',
    'Lighting',
    'Sound System',
    'Security',
    'Cleaning',
    'Transportation',
    'Prizes',
    'Miscellaneous'
  ];

  useEffect(() => {
    fetchData();
  }, [useBackend]);

  const fetchData = async () => {
    try {
      if (useBackend) {
        const [expensesData, festivalsData] = await Promise.all([
          expenseService.getAll(),
          festivalService.getAll()
        ]);
        setExpenses(expensesData || []);
        setFestivals(festivalsData || []);
      } else {
        // Fallback to mock data
        const mockData = await import('../../data/mockData');
        setExpenses(mockData.expenses);
        setFestivals(mockData.festivals);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Fallback to mock data on error
      const mockData = await import('../../data/mockData');
      setExpenses(mockData.expenses);
      setFestivals(mockData.festivals);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchFestival = festivalFilter === 'all' || expense.festivalId?.toString() === festivalFilter;
    const matchCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchFestival && matchCategory;
  });

  const totalExpense = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  const handleOpenModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense);
      setFormData({
        festivalId: expense.festivalId || '',
        description: expense.description || '',
        category: expense.category || '',
        amount: expense.amount || '',
        paidTo: expense.paidTo || '',
        expenseDate: expense.expenseDate || new Date().toISOString().split('T')[0],
        receiptUrl: expense.receiptUrl || ''
      });
    } else {
      setEditingExpense(null);
      setFormData({
        festivalId: '',
        description: '',
        category: '',
        amount: '',
        paidTo: '',
        expenseDate: new Date().toISOString().split('T')[0],
        receiptUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingExpense(null);
    setFormData({
      festivalId: '',
      description: '',
      category: '',
      amount: '',
      paidTo: '',
      expenseDate: new Date().toISOString().split('T')[0],
      receiptUrl: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.festivalId) {
      toast.error(language === 'hi' ? 'त्योहार चुनें' : 'Select festival');
      return;
    }
    if (!formData.description.trim()) {
      toast.error(language === 'hi' ? 'विवरण दर्ज करें' : 'Enter description');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error(language === 'hi' ? 'मान्य राशि दर्ज करें' : 'Enter valid amount');
      return;
    }

    setActionLoading(editingExpense ? 'edit' : 'add');
    try {
      if (useBackend) {
        const expenseData = {
          festivalId: parseInt(formData.festivalId),
          description: formData.description,
          category: formData.category || 'Miscellaneous',
          amount: parseFloat(formData.amount),
          paidTo: formData.paidTo,
          expenseDate: formData.expenseDate,
          receiptUrl: formData.receiptUrl
        };

        if (editingExpense) {
          await expenseService.update(editingExpense.id, expenseData);
          toast.success(language === 'hi' ? 'खर्च अपडेट किया गया' : 'Expense updated');
        } else {
          await expenseService.create(expenseData);
          toast.success(language === 'hi' ? 'खर्च जोड़ा गया' : 'Expense added');
        }
        await fetchData();
      } else {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(editingExpense ? 'Expense updated' : 'Expense added');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.message || (language === 'hi' ? 'त्रुटि' : 'Error'));
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(language === 'hi' ? 'क्या आप इस खर्च को हटाना चाहते हैं?' : 'Delete this expense?')) {
      return;
    }

    setActionLoading(id);
    try {
      if (useBackend) {
        await expenseService.delete(id);
        toast.success(language === 'hi' ? 'खर्च हटाया गया' : 'Expense deleted');
        await fetchData();
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success('Expense deleted');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error(error.message || (language === 'hi' ? 'त्रुटि' : 'Error'));
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
        <p className="text-earth-500 dark:text-earth-400 mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <Link 
        to="/admin"
        className="inline-flex items-center gap-2 text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('admin.dashboard')}</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
            {language === 'hi' ? 'खर्च प्रबंधन' : 'Manage Expenses'}
          </h1>
          <p className="text-earth-600 dark:text-earth-400">
            {language === 'hi' ? 'त्योहार खर्च जोड़ें और प्रबंधित करें' : 'Add and manage festival expenses'}
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {language === 'hi' ? 'खर्च जोड़ें' : 'Add Expense'}
        </Button>
      </div>

      {/* Stats Card */}
      <Card className="mb-6">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-saffron-100 dark:bg-saffron-900/40 flex items-center justify-center">
              <TrendingDown className="w-8 h-8 text-saffron-600 dark:text-saffron-400" />
            </div>
            <div>
              <p className="text-sm text-earth-500 dark:text-earth-400">
                {language === 'hi' ? 'कुल खर्च' : 'Total Expenses'}
              </p>
              <p className="text-3xl font-bold text-saffron-600 dark:text-saffron-400">
                {formatCurrency(totalExpense)}
              </p>
              <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
                {filteredExpenses.length} {language === 'hi' ? 'मदें' : 'items'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex items-center gap-2">
            <Filter className="w-5 h-5 text-earth-400" />
            <select
              value={festivalFilter}
              onChange={(e) => setFestivalFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">{language === 'hi' ? 'सभी त्योहार' : 'All Festivals'}</option>
              {festivals.map(festival => (
                <option key={festival.id} value={festival.id}>
                  {language === 'en' ? festival.nameEn : festival.name} ({festival.year})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-earth-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">{language === 'hi' ? 'सभी श्रेणियां' : 'All Categories'}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Expenses List */}
      {filteredExpenses.length > 0 ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-50 dark:bg-earth-800">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {language === 'hi' ? 'विवरण' : 'Description'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {language === 'hi' ? 'त्योहार' : 'Festival'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {language === 'hi' ? 'श्रेणी' : 'Category'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {language === 'hi' ? 'राशि' : 'Amount'}
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {language === 'hi' ? 'तारीख' : 'Date'}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-earth-700 dark:text-earth-300">
                    {language === 'hi' ? 'कार्रवाई' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-100 dark:divide-earth-700">
                {filteredExpenses.map((expense) => {
                  const festival = festivals.find(f => f.id === expense.festivalId);
                  const festivalName = festival 
                    ? (language === 'en' ? festival.nameEn : festival.name) 
                    : 'Unknown';
                  
                  return (
                    <tr key={expense.id}>
                      <td className="px-4 py-3">
                        <p className="font-medium text-earth-900 dark:text-cream-100">
                          {expense.description}
                        </p>
                        {expense.paidTo && (
                          <p className="text-sm text-earth-500 dark:text-earth-400">
                            {language === 'hi' ? 'को भुगतान:' : 'Paid to:'} {expense.paidTo}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-earth-700 dark:text-earth-300">
                        {festivalName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-lg bg-earth-100 dark:bg-earth-800 text-earth-700 dark:text-earth-300">
                          {expense.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-saffron-600 dark:text-saffron-400">
                        {formatCurrency(expense.amount)}
                      </td>
                      <td className="px-4 py-3 text-earth-500 dark:text-earth-400">
                        {formatDate(expense.expenseDate || expense.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(expense)}
                            className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg transition-colors"
                            disabled={actionLoading === expense.id}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(expense.id)}
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
                            disabled={actionLoading === expense.id}
                          >
                            {actionLoading === expense.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="py-12 text-center">
            <Receipt className="w-16 h-16 mx-auto text-earth-300 dark:text-earth-600 mb-4" />
            <h3 className="text-lg font-semibold text-earth-900 dark:text-cream-100 mb-2">
              {language === 'hi' ? 'कोई खर्च नहीं' : 'No Expenses'}
            </h3>
            <p className="text-earth-500 dark:text-earth-400 mb-6">
              {language === 'hi' ? 'त्योहार के खर्च जोड़ना शुरू करें' : 'Start adding festival expenses'}
            </p>
            <Button onClick={() => handleOpenModal()} leftIcon={<Plus className="w-4 h-4" />}>
              {language === 'hi' ? 'पहला खर्च जोड़ें' : 'Add First Expense'}
            </Button>
          </div>
        </Card>
      )}

      {/* Add/Edit Expense Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingExpense 
          ? (language === 'hi' ? 'खर्च संपादित करें' : 'Edit Expense')
          : (language === 'hi' ? 'नया खर्च जोड़ें' : 'Add New Expense')
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Festival Selection */}
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
              {language === 'hi' ? 'त्योहार' : 'Festival'} *
            </label>
            <select
              value={formData.festivalId}
              onChange={(e) => setFormData({ ...formData, festivalId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">{language === 'hi' ? 'त्योहार चुनें' : 'Select festival'}</option>
              {festivals.map(festival => (
                <option key={festival.id} value={festival.id}>
                  {language === 'en' ? festival.nameEn : festival.name} ({festival.year})
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <Input
            label={`${language === 'hi' ? 'विवरण' : 'Description'} *`}
            placeholder={language === 'hi' ? 'उदाहरण: टेंट किराया' : 'e.g., Tent rental'}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
          />

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
              {language === 'hi' ? 'श्रेणी' : 'Category'}
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-field"
            >
              <option value="">{language === 'hi' ? 'श्रेणी चुनें' : 'Select category'}</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
              {language === 'hi' ? 'राशि' : 'Amount'} *
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="1000"
                className="input-field pl-10"
                min="1"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Paid To */}
          <Input
            label={language === 'hi' ? 'को भुगतान' : 'Paid To'}
            placeholder={language === 'hi' ? 'उदाहरण: राम टेंट हाउस' : 'e.g., Ram Tent House'}
            value={formData.paidTo}
            onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
          />

          {/* Expense Date */}
          <Input
            label={language === 'hi' ? 'खर्च की तारीख' : 'Expense Date'}
            type="date"
            value={formData.expenseDate}
            onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
            leftIcon={<Calendar className="w-5 h-5" />}
          />

          {/* Receipt URL (Optional) */}
          <Input
            label={`${language === 'hi' ? 'रसीद URL' : 'Receipt URL'} (${t('common.optional')})`}
            placeholder="https://..."
            value={formData.receiptUrl}
            onChange={(e) => setFormData({ ...formData, receiptUrl: e.target.value })}
            helperText={language === 'hi' ? 'रसीद छवि का लिंक' : 'Link to receipt image'}
          />

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
              disabled={actionLoading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={actionLoading === 'add' || actionLoading === 'edit'}
            >
              {editingExpense 
                ? (language === 'hi' ? 'अपडेट करें' : 'Update')
                : (language === 'hi' ? 'जोड़ें' : 'Add')
              }
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ManageExpenses;
