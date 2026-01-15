import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, Badge } from '../components/ui';
import { 
  ArrowLeft,
  IndianRupee, 
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '../data/mockData';
import { contributionService } from '../services';

function MyContributions() {
  const { user, useBackend } = useAuth();
  const { t, language } = useLanguage();
  const [myContributions, setMyContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's contributions from backend
  useEffect(() => {
    const fetchContributions = async () => {
      try {
        if (useBackend) {
          const data = await contributionService.getMy();
          setMyContributions(data || []);
        } else {
          // Fallback to mock data
          const { contributions } = await import('../data/mockData');
          const filtered = contributions.filter(c => c.userId === user?.id || c.phone === user?.phone);
          setMyContributions(filtered);
        }
      } catch (error) {
        console.error('Error fetching contributions:', error);
        // Fallback to mock data on error
        const { contributions } = await import('../data/mockData');
        const filtered = contributions.filter(c => c.userId === user?.id || c.phone === user?.phone);
        setMyContributions(filtered);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchContributions();
    } else {
      setLoading(false);
    }
  }, [user, useBackend]);

  const totalContributed = myContributions
    .filter(c => c.status === 'verified' || c.status === 'VERIFIED')
    .reduce((sum, c) => sum + c.amount, 0);

  const pendingCount = myContributions.filter(c => c.status === 'pending' || c.status === 'PENDING').length;
  const verifiedCount = myContributions.filter(c => c.status === 'verified' || c.status === 'VERIFIED').length;

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-leaf-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-saffron-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-saffron-500" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
        <p className="text-earth-500 dark:text-earth-400 mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Back Button */}
      <Link 
        to="/"
        className="inline-flex items-center gap-2 text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('common.back')}</span>
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
          {t('contributions.myContributions')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('contributions.allContributionsDetails')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-leaf-600 dark:text-leaf-400">
              {formatCurrency(totalContributed)}
            </p>
            <p className="text-xs text-earth-500 dark:text-earth-400">{t('home.totalContribution')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-earth-900 dark:text-cream-100">
              {verifiedCount}
            </p>
            <p className="text-xs text-earth-500 dark:text-earth-400">{t('contributions.verified')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-xl md:text-2xl font-bold text-saffron-600 dark:text-saffron-400">
              {pendingCount}
            </p>
            <p className="text-xs text-earth-500 dark:text-earth-400">{t('contributions.pending')}</p>
          </div>
        </Card>
      </div>

      {/* Contributions List */}
      {myContributions.length > 0 ? (
        <div className="space-y-4">
          {myContributions.map((contrib) => {
            const festName = language === 'en' ? (contrib.festivalNameEn || contrib.festivalName) : contrib.festivalName;
            return (
              <Card key={contrib.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(contrib.status)}
                      <div>
                        <h3 className="font-semibold text-earth-900 dark:text-cream-100">
                          {festName}
                        </h3>
                        <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDateTime(contrib.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-earth-900 dark:text-cream-100">
                        {formatCurrency(contrib.amount)}
                      </p>
                      <Badge variant={contrib.status?.toLowerCase()} size="sm">
                        {contrib.status?.toLowerCase() === 'pending' ? t('contributions.pending') : 
                         contrib.status?.toLowerCase() === 'verified' ? t('contributions.verified') : t('contributions.rejected')}
                      </Badge>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {contrib.status?.toLowerCase() === 'verified' && contrib.verifiedAt && (
                    <div className="mt-2 pt-2 border-t border-cream-100 dark:border-earth-700">
                      <p className="text-sm text-leaf-600 dark:text-leaf-400">
                        {t('common.verified')}: {formatDateTime(contrib.verifiedAt)}
                      </p>
                    </div>
                  )}

                  {contrib.status?.toLowerCase() === 'pending' && (
                    <div className="mt-2 pt-2 border-t border-cream-100 dark:border-earth-700">
                      <p className="text-sm text-saffron-600 dark:text-saffron-400">
                        {t('contributions.verificationPending')}
                      </p>
                    </div>
                  )}
                  
                  {contrib.status?.toLowerCase() === 'rejected' && contrib.rejectionReason && (
                    <div className="mt-2 pt-2 border-t border-cream-100 dark:border-earth-700">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {t('contributions.rejectionReason')}: {contrib.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="py-12 text-center">
            <IndianRupee className="w-16 h-16 mx-auto text-earth-300 dark:text-earth-600 mb-4" />
            <h3 className="text-lg font-semibold text-earth-900 dark:text-cream-100 mb-2">
              {t('contributions.noContributions')}
            </h3>
            <p className="text-earth-500 dark:text-earth-400 mb-6">
              {t('contributions.verificationPending')}
            </p>
            <Link to="/festivals">
              <button className="btn-primary">
                {t('contributions.contribute')}
              </button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default MyContributions;
