import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Card, Badge } from '../../components/ui';
import { 
  Users, 
  Calendar, 
  IndianRupee, 
  Image as ImageIcon,
  Bell,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../../data/mockData';
import { adminService, contributionService } from '../../services';

function AdminDashboard() {
  const { user, isSuperAdmin, useBackend } = useAuth();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    pendingContributions: 0,
    totalCollection: 0,
    activeFestivals: 0,
    totalMembers: 0
  });
  const [recentContributions, setRecentContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  const displayName = language === 'en' ? (user?.nameEn || user?.name) : user?.name;

  // Fetch stats and recent contributions from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (useBackend) {
          // Fetch admin stats
          const statsData = await adminService.getStats();
          setStats({
            pendingContributions: statsData.pendingContributions || 0,
            totalCollection: statsData.totalCollection || 0,
            activeFestivals: statsData.activeFestivals || 0,
            totalMembers: statsData.totalMembers || 0
          });
          
          // Fetch recent contributions
          const recentData = await contributionService.getRecent();
          setRecentContributions(recentData || []);
        } else {
          // Fallback to mock data
          const { festivals, contributions, users } = await import('../../data/mockData');
          setStats({
            pendingContributions: contributions.filter(c => c.status === 'pending').length,
            totalCollection: contributions.filter(c => c.status === 'verified').reduce((sum, c) => sum + c.amount, 0),
            activeFestivals: festivals.filter(f => f.status === 'ongoing').length,
            totalMembers: users.length
          });
          setRecentContributions(contributions.slice(0, 5));
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
        // Fallback to mock data on error
        const { festivals, contributions, users } = await import('../../data/mockData');
        setStats({
          pendingContributions: contributions.filter(c => c.status === 'pending').length,
          totalCollection: contributions.filter(c => c.status === 'verified').reduce((sum, c) => sum + c.amount, 0),
          activeFestivals: festivals.filter(f => f.status === 'ongoing').length,
          totalMembers: users.length
        });
        setRecentContributions(contributions.slice(0, 5));
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [useBackend]);

  const adminLinks = [
    {
      title: t('admin.verifyContributions'),
      description: t('admin.reviewPayments'),
      icon: CheckCircle,
      to: '/admin/verify-contributions',
      color: 'primary',
      badge: stats.pendingContributions
    },
    {
      title: t('admin.manageFestivals'),
      description: t('admin.addEditFestivals'),
      icon: Calendar,
      to: '/admin/manage-festivals',
      color: 'saffron',
    },
    {
      title: t('admin.uploadPhotos'),
      description: t('admin.addPhotosToGallery'),
      icon: ImageIcon,
      to: '/admin/upload-photos',
      color: 'leaf',
    },
    {
      title: t('admin.sendNotification'),
      description: t('admin.notifyAllMembers'),
      icon: Bell,
      to: '/admin/send-notification',
      color: 'primary',
    },
  ];

  if (isSuperAdmin) {
    adminLinks.push({
      title: t('admin.manageMembers'),
      description: t('admin.membersAndRoles'),
      icon: Users,
      to: '/admin/manage-members',
      color: 'earth',
    });
  }

  const getColorClasses = (color) => {
    const colors = {
      primary: {
        bg: 'bg-primary-100 dark:bg-primary-900/40',
        text: 'text-primary-600 dark:text-primary-400',
        badge: 'bg-primary-500'
      },
      saffron: {
        bg: 'bg-saffron-100 dark:bg-saffron-900/40',
        text: 'text-saffron-600 dark:text-saffron-400',
        badge: 'bg-saffron-500'
      },
      leaf: {
        bg: 'bg-leaf-100 dark:bg-leaf-900/40',
        text: 'text-leaf-600 dark:text-leaf-400',
        badge: 'bg-leaf-500'
      },
      earth: {
        bg: 'bg-earth-100 dark:bg-earth-800',
        text: 'text-earth-600 dark:text-earth-400',
        badge: 'bg-earth-500'
      }
    };
    return colors[color] || colors.primary;
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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
          {t('admin.dashboard')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('common.welcome')}, {displayName}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-saffron-100 dark:bg-saffron-900/40 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-saffron-600 dark:text-saffron-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-earth-900 dark:text-cream-100">{stats.pendingContributions}</p>
                <p className="text-xs text-earth-500 dark:text-earth-400">{t('contributions.pending')}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-leaf-100 dark:bg-leaf-900/40 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-leaf-600 dark:text-leaf-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-earth-900 dark:text-cream-100">{formatCurrency(stats.totalCollection)}</p>
                <p className="text-xs text-earth-500 dark:text-earth-400">{t('festivals.collection')}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-earth-900 dark:text-cream-100">{stats.activeFestivals}</p>
                <p className="text-xs text-earth-500 dark:text-earth-400">{t('festivals.ongoing')}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-earth-100 dark:bg-earth-800 flex items-center justify-center">
                <Users className="w-6 h-6 text-earth-600 dark:text-earth-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-earth-900 dark:text-cream-100">{stats.totalMembers}</p>
                <p className="text-xs text-earth-500 dark:text-earth-400">{t('home.members')}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Links */}
      <div className="mb-8">
        <h2 className="text-xl font-display font-semibold text-earth-900 dark:text-cream-100 mb-4">
          {t('admin.quickActions')}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminLinks.map((link) => {
            const colors = getColorClasses(link.color);
            return (
              <Link key={link.to} to={link.to}>
                <Card hoverable className="h-full">
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl ${colors.bg} flex items-center justify-center relative`}>
                      <link.icon className={`w-7 h-7 ${colors.text}`} />
                      {link.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-earth-900 dark:text-cream-100">{link.title}</h3>
                      <p className="text-sm text-earth-500 dark:text-earth-400">{link.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-earth-400" />
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="p-4 md:p-5 border-b border-cream-100 dark:border-earth-700">
          <h2 className="text-xl font-display font-semibold text-earth-900 dark:text-cream-100">
            {t('admin.recentActivity')}
          </h2>
        </div>
        <div className="divide-y divide-cream-100 dark:divide-earth-700">
          {recentContributions.length > 0 ? (
            recentContributions.map((contrib) => {
              const contribName = language === 'en' ? (contrib.userNameEn || contrib.userName) : contrib.userName;
              const festName = language === 'en' ? (contrib.festivalNameEn || contrib.festivalName) : contrib.festivalName;
              const status = contrib.status?.toLowerCase() || 'pending';
              return (
                <div key={contrib.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-semibold">
                      {contribName?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-earth-900 dark:text-cream-100">
                        {contribName || 'Unknown'}
                      </p>
                      <p className="text-sm text-earth-500 dark:text-earth-400">
                        {festName || 'Unknown Festival'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-earth-900 dark:text-cream-100">
                      {formatCurrency(contrib.amount)}
                    </p>
                    <Badge variant={status} size="sm">
                      {status === 'pending' ? t('contributions.pending') : 
                       status === 'verified' ? t('contributions.verified') : t('contributions.rejected')}
                    </Badge>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-earth-500 dark:text-earth-400">
              {t('admin.noRecentActivity')}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export default AdminDashboard;
