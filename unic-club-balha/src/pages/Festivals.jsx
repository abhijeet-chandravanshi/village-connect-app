import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Card, Badge, Button } from '../components/ui';
import { 
  Calendar, 
  IndianRupee, 
  Users, 
  SlidersHorizontal, 
  Search,
  Loader2
} from 'lucide-react';
import { formatCurrency } from '../data/mockData';
import { festivalService } from '../services';

function Festivals() {
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [filter, setFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch festivals from backend
  useEffect(() => {
    const fetchFestivals = async () => {
      try {
        if (useBackend) {
          const data = await festivalService.getAll();
          setFestivals(data || []);
        } else {
          // Fallback to mock data
          const { festivals: mockFestivals } = await import('../data/mockData');
          setFestivals(mockFestivals);
        }
      } catch (error) {
        console.error('Error fetching festivals:', error);
        // Fallback to mock data on error
        const { festivals: mockFestivals } = await import('../data/mockData');
        setFestivals(mockFestivals);
      } finally {
        setLoading(false);
      }
    };
    fetchFestivals();
  }, [useBackend]);

  const years = [...new Set(festivals.map(f => f.year))].sort((a, b) => b - a);

  const filteredFestivals = festivals.filter(f => {
    const matchFilter = filter === 'all' || f.status?.toLowerCase() === filter;
    const matchYear = yearFilter === 'all' || f.year?.toString() === yearFilter;
    const displayName = language === 'en' ? f.nameEn : f.name;
    const matchSearch = displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchFilter && matchYear && matchSearch;
  });

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
          {t('festivals.title')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('festivals.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
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

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-earth-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">{t('common.all')}</option>
                <option value="upcoming">{t('festivals.upcoming')}</option>
                <option value="ongoing">{t('festivals.ongoing')}</option>
                <option value="completed">{t('festivals.completed')}</option>
              </select>
            </div>

            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-earth-400" />
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">{t('common.all')} {t('common.year')}</option>
                {years.map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Festival Cards */}
      {filteredFestivals.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFestivals.map((festival) => {
            const displayName = language === 'en' ? festival.nameEn : festival.name;
            const progress = Math.min((festival.totalCollection / festival.expectedBudget) * 100, 100);
            return (
              <Link key={festival.id} to={`/festivals/${festival.id}`}>
                <Card hoverable className="h-full overflow-hidden">
                  <div className="relative h-40">
                    <img 
                      src={festival.image} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={festival.status}>
                        {festival.status === 'upcoming' ? t('festivals.upcoming') : 
                         festival.status === 'ongoing' ? t('festivals.ongoing') : t('festivals.completed')}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-white text-sm font-medium rounded-lg">
                        {festival.year}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-lg text-earth-900 dark:text-cream-100 mb-2">
                      {displayName}
                    </h3>
                    <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-1 mb-3">
                      <Calendar className="w-4 h-4" /> {festival.startDate}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-earth-500 dark:text-earth-400">{t('festivals.collection')}</span>
                        <span className="font-medium text-earth-900 dark:text-cream-100">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-cream-200 dark:bg-earth-700 rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-primary-500 to-saffron-500 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-leaf-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {formatCurrency(festival.totalCollection)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-500" />
                        <span className="text-earth-600 dark:text-earth-400">
                          {festival.contributorCount} {t('home.members')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="py-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-earth-300 dark:text-earth-600 mb-4" />
            <p className="text-earth-500 dark:text-earth-400 text-lg">
              {t('festivals.noFestivalsFound')}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Festivals;
