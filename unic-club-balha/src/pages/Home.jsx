import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, Badge, Button } from '../components/ui';
import { 
  Calendar, 
  IndianRupee, 
  Users,
  ChevronRight,
  Gift,
  Image as ImageIcon,
  Bell,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../data/mockData';
import { festivalService, contributionService } from '../services';

function Home() {
  const { user, isAdmin, useBackend } = useAuth();
  const { t, language } = useLanguage();
  const [festivals, setFestivals] = useState([]);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useBackend) {
          const [festivalsData, contributionsData] = await Promise.all([
            festivalService.getActive().catch(() => []),
            contributionService.getRecent().catch(() => [])
          ]);
          setFestivals(festivalsData || []);
          setContributions(contributionsData || []);
        } else {
          // Fallback to mock data
          const mockData = await import('../data/mockData');
          setFestivals(mockData.festivals.filter(f => f.status === 'ongoing' || f.status === 'upcoming'));
          setContributions(mockData.contributions.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Fallback to mock data on error
        const mockData = await import('../data/mockData');
        setFestivals(mockData.festivals.filter(f => f.status === 'ongoing' || f.status === 'upcoming'));
        setContributions(mockData.contributions.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [useBackend]);

  const displayName = language === 'en' ? (user?.nameEn || user?.name) : user?.name;
  const firstName = displayName?.split(' ')[0] || t('common.friend');

  const activeFestivals = festivals.filter(f => {
    const status = f.status?.toLowerCase();
    return status === 'ongoing' || status === 'upcoming';
  });
  const recentContributions = contributions.slice(0, 5);
  const totalCollection = contributions
    .filter(c => c.status === 'verified' || c.status === 'VERIFIED')
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  const quickLinks = [
    { icon: Gift, label: t('contributions.contribute'), to: '/festivals', color: 'primary' },
    { icon: ImageIcon, label: t('gallery.title'), to: '/gallery', color: 'saffron' },
    { icon: Bell, label: t('notifications.title'), to: '/notifications', color: 'leaf' },
  ];

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
      {/* Welcome Section */}
      <Card className="mb-6">
        <div className="p-4 md:p-6">
          <div className="space-y-5">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
                🙏 {t('common.welcome')}, {firstName}!
              </h1>
              <p className="text-earth-600 dark:text-earth-400">
                {t('common.appName')}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-cream-50 dark:bg-earth-800 rounded-xl text-center">
                <p className="text-xl md:text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {activeFestivals.length}
                </p>
                <p className="text-xs text-earth-500 dark:text-earth-400">{t('home.activeFestivals')}</p>
              </div>
              <div className="p-3 bg-cream-50 dark:bg-earth-800 rounded-xl text-center">
                <p className="text-xl md:text-2xl font-bold text-leaf-600 dark:text-leaf-400">
                  {formatCurrency(totalCollection)}
                </p>
                <p className="text-xs text-earth-500 dark:text-earth-400">{t('home.totalCollection')}</p>
              </div>
              <div className="p-3 bg-cream-50 dark:bg-earth-800 rounded-xl text-center">
                <p className="text-xl md:text-2xl font-bold text-saffron-600 dark:text-saffron-400">
                  {contributions.length}
                </p>
                <p className="text-xs text-earth-500 dark:text-earth-400">{t('home.members')}</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-3">
              {quickLinks.map((link) => {
                const colorClasses = {
                  primary: 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
                  saffron: 'bg-saffron-100 dark:bg-saffron-900/40 text-saffron-600 dark:text-saffron-400',
                  leaf: 'bg-leaf-100 dark:bg-leaf-900/40 text-leaf-600 dark:text-leaf-400'
                };
                return (
                  <Link 
                    key={link.to} 
                    to={link.to}
                    className={`flex-1 p-3 rounded-xl ${colorClasses[link.color]} text-center hover:shadow-warm transition-shadow`}
                  >
                    <link.icon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-xs font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Active Festivals */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-display font-semibold text-earth-900 dark:text-cream-100">
            {t('home.upcomingFestivals')}
          </h2>
          <Link 
            to="/festivals" 
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            {t('home.viewAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {activeFestivals.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {activeFestivals.slice(0, 4).map((festival) => (
              <Link key={festival.id} to={`/festivals/${festival.id}`}>
                <Card hoverable className="h-full">
                  <div className="flex">
                    <img 
                      src={festival.imageUrl || festival.image || 'https://images.unsplash.com/photo-1574265040831-67b58fc79036?w=800'} 
                      alt={festival.name}
                      className="w-24 h-24 object-cover rounded-l-2xl"
                    />
                    <div className="p-3 flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-earth-900 dark:text-cream-100">
                          {language === 'en' ? festival.nameEn : festival.name}
                        </h3>
                        <Badge variant={festival.status} size="sm">
                          {festival.status === 'upcoming' ? t('festivals.upcoming') : 
                           festival.status === 'ongoing' ? t('festivals.ongoing') : t('festivals.completed')}
                        </Badge>
                      </div>
                      <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-1 mb-2">
                        <Calendar className="w-4 h-4" /> {festival.startDate}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-cream-200 dark:bg-earth-700 rounded-full">
                          <div 
                            className="h-full bg-primary-500 rounded-full"
                            style={{ width: `${Math.min((festival.totalCollection / festival.expectedBudget) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-earth-500 dark:text-earth-400">
                          {Math.round((festival.totalCollection / festival.expectedBudget) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 mx-auto text-earth-300 dark:text-earth-600 mb-2" />
              <p className="text-earth-500 dark:text-earth-400">
                {t('common.noActiveFestivals')}
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Contributions */}
      <Card>
        <div className="p-4 md:p-5 border-b border-cream-100 dark:border-earth-700 flex items-center justify-between">
          <h2 className="text-xl font-display font-semibold text-earth-900 dark:text-cream-100">
            {t('admin.recentActivity')}
          </h2>
          <Link 
            to="/my-contributions" 
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
          >
            {t('home.viewAll')} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-cream-100 dark:divide-earth-700">
          {recentContributions.map((contrib) => {
            const contribName = language === 'en' ? (contrib.userNameEn || contrib.userName) : contrib.userName;
            const festName = language === 'en' ? (contrib.festivalNameEn || contrib.festivalName) : contrib.festivalName;
            return (
              <div key={contrib.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                    {[...contribName || ''][0] || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-earth-900 dark:text-cream-100">
                      {contribName}
                    </p>
                    <p className="text-sm text-earth-500 dark:text-earth-400">
                      {festName}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-earth-900 dark:text-cream-100">
                    {formatCurrency(contrib.amount)}
                  </p>
                  <Badge variant={contrib.status} size="sm">
                    {contrib.status === 'pending' ? t('contributions.pending') : 
                     contrib.status === 'verified' ? t('contributions.verified') : t('contributions.rejected')}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Admin Quick Access */}
      {isAdmin && (
        <Link to="/admin-dashboard">
          <Card hoverable className="mt-6">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-earth-900 dark:text-cream-100">
                    {t('admin.dashboard')}
                  </h3>
                  <p className="text-sm text-earth-500 dark:text-earth-400">
                    {contributions.filter(c => c.status === 'pending' || c.status === 'PENDING').length} {t('contributions.pending')}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-earth-400" />
            </div>
          </Card>
        </Link>
      )}
    </div>
  );
}

export default Home;
