import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Modal } from '../../components/ui';
import { 
  ArrowLeft,
  CheckCircle, 
  XCircle, 
  Eye,
  IndianRupee,
  Calendar,
  Search,
  SlidersHorizontal,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDateTime } from '../../data/mockData';
import { contributionService, imageService } from '../../services';

function VerifyContributions() {
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [selectedContribution, setSelectedContribution] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [proofImageUrl, setProofImageUrl] = useState(null);
  const [loadingProof, setLoadingProof] = useState(false);

  // Fetch contributions from backend
  useEffect(() => {
    fetchContributions();
  }, [useBackend]);

  // Fetch proof image when contribution is selected
  useEffect(() => {
    const fetchProofImage = async () => {
      if (!selectedContribution) {
        setProofImageUrl(null);
        return;
      }

      // If there's an existing URL (mock data or legacy), use it
      if (selectedContribution.proofImageUrl) {
        setProofImageUrl(selectedContribution.proofImageUrl);
        return;
      }

      // Try to fetch from API (byte array storage)
      if (useBackend && selectedContribution.id) {
        setLoadingProof(true);
        try {
          const hasProof = await imageService.hasPaymentProof(selectedContribution.id);
          if (hasProof) {
            // Download the image and create blob URL
            const blob = await imageService.downloadPaymentProof(selectedContribution.id);
            const url = URL.createObjectURL(blob);
            setProofImageUrl(url);
          } else {
            setProofImageUrl(null);
          }
        } catch (error) {
          console.error('Error fetching proof image:', error);
          setProofImageUrl(null);
        } finally {
          setLoadingProof(false);
        }
      }
    };

    fetchProofImage();

    // Cleanup blob URL when component unmounts or selection changes
    return () => {
      if (proofImageUrl && proofImageUrl.startsWith('blob:')) {
        URL.revokeObjectURL(proofImageUrl);
      }
    };
  }, [selectedContribution, useBackend]);

  const fetchContributions = async () => {
    try {
      if (useBackend) {
        const data = await contributionService.getPending();
        setContributions(data || []);
      } else {
        // Fallback to mock data
        const { contributions: mockContributions } = await import('../../data/mockData');
        setContributions(mockContributions);
      }
    } catch (error) {
      console.error('Error fetching contributions:', error);
      // Fallback to mock data on error
      const { contributions: mockContributions } = await import('../../data/mockData');
      setContributions(mockContributions);
    } finally {
      setFetchingData(false);
    }
  };

  const filteredContributions = contributions.filter(c => {
    const status = c.status?.toLowerCase();
    const matchFilter = filter === 'all' || status === filter;
    const searchName = language === 'en' ? (c.userNameEn || c.userName || '') : (c.userName || '');
    const searchFest = language === 'en' ? (c.festivalNameEn || c.festivalName || '') : (c.festivalName || '');
    const matchSearch = searchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       searchFest.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleVerify = async (id) => {
    setLoading(id);
    try {
      if (useBackend) {
        await contributionService.verify(id);
        // Refresh the list
        await fetchContributions();
      }
      toast.success(t('admin.contributionVerified'));
    } catch (error) {
      console.error('Error verifying contribution:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setLoading(null);
      setSelectedContribution(null);
    }
  };

  const handleReject = async (id, reason = '') => {
    setLoading(id);
    try {
      if (useBackend) {
        await contributionService.reject(id, reason);
        // Refresh the list
        await fetchContributions();
      }
      toast.error(t('admin.contributionRejected'));
    } catch (error) {
      console.error('Error rejecting contribution:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setLoading(null);
      setSelectedContribution(null);
    }
  };

  if (fetchingData) {
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
        to="/admin" 
        className="inline-flex items-center gap-2 text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('admin.dashboard')}</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
          {t('admin.verifyContributions')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('admin.reviewAndVerify')}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
              <input
                type="text"
                placeholder={`${t('common.search')}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-earth-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('contributions.pending')}</option>
                <option value="verified">{t('contributions.verified')}</option>
                <option value="rejected">{t('contributions.rejected')}</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Contributions List */}
      <Card>
        <div className="divide-y divide-cream-100 dark:divide-earth-700">
          {filteredContributions.length > 0 ? (
            filteredContributions.map((contrib) => {
              const contribName = language === 'en' ? (contrib.userNameEn || contrib.userName) : contrib.userName;
              const festName = language === 'en' ? (contrib.festivalNameEn || contrib.festivalName) : contrib.festivalName;
              return (
                <div key={contrib.id} className="p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                        {contribName[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-earth-900 dark:text-cream-100">
                          {contribName}
                        </h3>
                        <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {festName}
                        </p>
                        <p className="text-xs text-earth-400 mt-1">
                          {formatDateTime(contrib.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-earth-900 dark:text-cream-100">
                          {formatCurrency(contrib.amount)}
                        </p>
                        <Badge variant={contrib.status} size="sm">
                          {contrib.status === 'pending' ? t('contributions.pending') : 
                           contrib.status === 'verified' ? t('contributions.verified') : t('contributions.rejected')}
                        </Badge>
                      </div>

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedContribution(contrib)}
                        leftIcon={<Eye className="w-4 h-4" />}
                      >
                        {t('common.view')}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto text-earth-300 dark:text-earth-600 mb-4" />
              <p className="text-earth-500 dark:text-earth-400 text-lg">
                {t('admin.noContributionsFound')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* View Modal */}
      <Modal
        isOpen={!!selectedContribution}
        onClose={() => setSelectedContribution(null)}
        title={t('admin.contributionDetails')}
        size="lg"
      >
        {selectedContribution && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-cream-50 dark:bg-earth-800 rounded-xl">
              <div className="w-14 h-14 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-xl">
                {(language === 'en' ? (selectedContribution.userNameEn || selectedContribution.userName) : selectedContribution.userName)[0]}
              </div>
              <div>
                <h3 className="font-semibold text-lg text-earth-900 dark:text-cream-100">
                  {language === 'en' ? (selectedContribution.userNameEn || selectedContribution.userName) : selectedContribution.userName}
                </h3>
                <p className="text-earth-500 dark:text-earth-400">
                  {language === 'en' ? (selectedContribution.festivalNameEn || selectedContribution.festivalName) : selectedContribution.festivalName}
                </p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-earth-500 dark:text-earth-400">{t('common.amount')}</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(selectedContribution.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-earth-500 dark:text-earth-400">{t('common.status')}</p>
                <Badge variant={selectedContribution.status}>
                  {selectedContribution.status === 'pending' ? t('contributions.pending') : 
                   selectedContribution.status === 'verified' ? t('contributions.verified') : t('contributions.rejected')}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-earth-500 dark:text-earth-400">{t('common.date')}</p>
                <p className="font-medium text-earth-900 dark:text-cream-100">
                  {formatDateTime(selectedContribution.createdAt)}
                </p>
              </div>
              {selectedContribution.transactionId && (
                <div>
                  <p className="text-sm text-earth-500 dark:text-earth-400">{t('contributions.transactionId')}</p>
                  <p className="font-mono text-earth-900 dark:text-cream-100">
                    {selectedContribution.transactionId}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Proof */}
            <div>
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-2">{t('contributions.paymentProof')}</p>
              {loadingProof ? (
                <div className="flex items-center justify-center py-8 bg-cream-50 dark:bg-earth-800 rounded-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                  <span className="ml-2 text-earth-500 dark:text-earth-400">Loading proof...</span>
                </div>
              ) : proofImageUrl ? (
                <img
                  src={proofImageUrl}
                  alt="Payment Proof"
                  className="w-full max-h-64 object-contain rounded-xl border border-cream-200 dark:border-earth-700"
                />
              ) : (
                <div className="py-8 text-center bg-cream-50 dark:bg-earth-800 rounded-xl">
                  <p className="text-earth-500 dark:text-earth-400">No proof image uploaded</p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedContribution.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t border-cream-100 dark:border-earth-700">
                <Button
                  variant="danger"
                  onClick={() => handleReject(selectedContribution.id)}
                  loading={loading === selectedContribution.id}
                  leftIcon={<XCircle className="w-4 h-4" />}
                  className="flex-1"
                >
                  {t('contributions.reject')}
                </Button>
                <Button
                  onClick={() => handleVerify(selectedContribution.id)}
                  loading={loading === selectedContribution.id}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  className="flex-1"
                >
                  {t('contributions.verify')}
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VerifyContributions;
