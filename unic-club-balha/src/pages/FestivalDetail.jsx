import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button } from '../components/ui';
import { 
  ArrowLeft, 
  Calendar, 
  IndianRupee, 
  Users,
  TrendingUp,
  Image as ImageIcon,
  FileText,
  Loader2
} from 'lucide-react';
import { formatCurrency, formatDate } from '../data/mockData';
import { festivalService, contributionService } from '../services';

function FestivalDetail() {
  const { id } = useParams();
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [festival, setFestival] = useState(null);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch festival and contributions from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useBackend) {
          const [festivalData, contributionsData] = await Promise.all([
            festivalService.getById(id),
            contributionService.getVerifiedByFestival(id).catch(() => [])
          ]);
          setFestival(festivalData);
          setContributions(contributionsData || []);
        } else {
          // Fallback to mock data
          const { festivals, contributions: mockContributions } = await import('../data/mockData');
          const mockFestival = festivals.find(f => f.id === id);
          setFestival(mockFestival);
          setContributions(mockContributions.filter(c => c.festivalId === id && c.status === 'verified'));
        }
      } catch (error) {
        console.error('Error fetching festival data:', error);
        // Fallback to mock data on error
        const { festivals, contributions: mockContributions } = await import('../data/mockData');
        const mockFestival = festivals.find(f => f.id === id);
        setFestival(mockFestival);
        setContributions(mockContributions.filter(c => c.festivalId === id && c.status === 'verified'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, useBackend]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
        <p className="text-earth-500 dark:text-earth-400 mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-earth-500 dark:text-earth-400 text-lg">
          {t('common.festivalNotFound')}
        </p>
        <Link to="/festivals" className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const contributorCount = festival.contributorCount || new Set(contributions.map(c => c.userId)).size;
  const displayName = language === 'en' ? festival.nameEn : festival.name;
  const progress = Math.min(((festival.totalCollection || 0) / (festival.expectedBudget || 1)) * 100, 100);
  const balance = (festival.totalCollection || 0) - (festival.totalExpense || 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Back Button */}
      <Link 
        to="/festivals"
        className="inline-flex items-center gap-2 text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('common.back')}</span>
      </Link>

      {/* Hero Section */}
      <Card className="mb-6 overflow-hidden">
        <div className="relative h-48 md:h-64">
          <img 
            src={festival.imageUrl || festival.image || 'https://images.unsplash.com/photo-1574265040831-67b58fc79036?w=800'} 
            alt={displayName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant={festival.status} className="mb-2">
                  {festival.status === 'upcoming' ? t('festivals.upcoming') : 
                   festival.status === 'ongoing' ? t('festivals.ongoing') : t('festivals.completed')}
                </Badge>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-white">
                  {displayName}
                </h1>
              </div>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white font-semibold">
                {festival.year}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Date Info */}
      <Card className="mb-6">
        <div className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <p className="text-sm text-earth-500 dark:text-earth-400">{t('admin.startDate')}</p>
            <p className="font-semibold text-earth-900 dark:text-cream-100">
              {formatDate(festival.startDate)}
              {festival.endDate && ` - ${formatDate(festival.endDate)}`}
            </p>
          </div>
        </div>
      </Card>

      {/* Description */}
      {festival.description && (
        <Card className="mb-6">
          <div className="p-4 md:p-5">
            <h2 className="font-semibold text-earth-900 dark:text-cream-100 mb-2">
              {t('admin.description')}
            </h2>
            <p className="text-earth-600 dark:text-earth-400">
              {festival.description}
            </p>
          </div>
        </Card>
      )}

      {/* Financial Summary */}
      <Card className="mb-6">
        <div className="p-4 md:p-5 border-b border-cream-100 dark:border-earth-700">
          <h2 className="text-lg font-display font-semibold text-earth-900 dark:text-cream-100">
            {t('festivals.financialSummary')}
          </h2>
        </div>
        <div className="p-4 md:p-5">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-earth-500 dark:text-earth-400">{t('festivals.collectionProgress')}</span>
              <span className="font-semibold text-earth-900 dark:text-cream-100">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 bg-cream-200 dark:bg-earth-700 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-saffron-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-earth-500 dark:text-earth-400 mt-2">
              {formatCurrency(festival.totalCollection)} / {formatCurrency(festival.expectedBudget)}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-cream-50 dark:bg-earth-800 rounded-xl text-center">
              <IndianRupee className="w-5 h-5 mx-auto text-primary-500 mb-1" />
              <p className="text-lg font-bold text-earth-900 dark:text-cream-100">
                {formatCurrency(festival.totalCollection)}
              </p>
              <p className="text-xs text-earth-500 dark:text-earth-400">{t('festivals.collection')}</p>
            </div>
            <div className="p-3 bg-cream-50 dark:bg-earth-800 rounded-xl text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-saffron-500 mb-1" />
              <p className="text-lg font-bold text-earth-900 dark:text-cream-100">
                {formatCurrency(festival.totalExpense)}
              </p>
              <p className="text-xs text-earth-500 dark:text-earth-400">{t('festivals.expense')}</p>
            </div>
            <div className="p-3 bg-cream-50 dark:bg-earth-800 rounded-xl text-center">
              <IndianRupee className="w-5 h-5 mx-auto text-leaf-500 mb-1" />
              <p className={`text-lg font-bold ${balance >= 0 ? 'text-leaf-600 dark:text-leaf-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(balance)}
              </p>
              <p className="text-xs text-earth-500 dark:text-earth-400">{t('festivals.balance')}</p>
            </div>
            <div className="p-3 bg-cream-50 dark:bg-earth-800 rounded-xl text-center">
              <Users className="w-5 h-5 mx-auto text-earth-500 mb-1" />
              <p className="text-lg font-bold text-earth-900 dark:text-cream-100">
                {contributorCount}
              </p>
              <p className="text-xs text-earth-500 dark:text-earth-400">{t('festivals.contributors')}</p>
            </div>
          </div>

          {/* Average */}
          {contributorCount > 0 && (
            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl text-center">
              <p className="text-sm text-primary-600 dark:text-primary-400">
                {t('festivals.avgContribution')}: <span className="font-bold">{formatCurrency(festival.totalCollection / contributorCount)}</span>
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <Link to={`/transparency/${festival.id}`}>
          <Button variant="secondary" className="w-full" leftIcon={<FileText className="w-4 h-4" />}>
            {t('transparency.title')}
          </Button>
        </Link>
        
        {festival.status !== 'completed' && (
          <Link to={`/contribute/${festival.id}`}>
            <Button className="w-full" leftIcon={<IndianRupee className="w-4 h-4" />}>
              {t('contributions.contribute')}
            </Button>
          </Link>
        )}
        
        <Link to="/gallery" className="col-span-2">
          <Button variant="secondary" className="w-full" leftIcon={<ImageIcon className="w-4 h-4" />}>
            {t('common.viewPhotos')}
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default FestivalDetail;
