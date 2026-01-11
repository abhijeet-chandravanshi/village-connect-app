import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Button, Input } from '../components/ui';
import { User, Calendar, MapPin, ArrowRight, Sun, Moon, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

function ProfileSetup() {
  const { user, updateProfile } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    nameEn: user?.nameEn || '',
    dateOfBirth: user?.dateOfBirth || '',
    ward: user?.ward || '',
    wardEn: user?.wardEn || '',
  });

  const wards = [
    { hi: 'वार्ड 1', en: 'Ward 1' },
    { hi: 'वार्ड 2', en: 'Ward 2' },
    { hi: 'वार्ड 3', en: 'Ward 3' },
    { hi: 'वार्ड 4', en: 'Ward 4' },
    { hi: 'वार्ड 5', en: 'Ward 5' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error(t('profile.enterName'));
      return;
    }
    
    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success(t('profile.profileUpdated'));
      navigate('/');
    } catch (error) {
      toast.error(t('common.updateFailed'));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-cream-100 to-primary-50 dark:from-earth-950 dark:via-earth-900 dark:to-earth-950 flex flex-col transition-colors duration-300">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-saffron-200 dark:bg-saffron-900/30 rounded-full filter blur-3xl opacity-30 translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-200 dark:bg-primary-900/30 rounded-full filter blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2" />
      
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 dark:bg-earth-800/80 backdrop-blur-sm text-earth-700 dark:text-earth-300 hover:bg-white dark:hover:bg-earth-700 transition-colors shadow-sm"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">{language === 'hi' ? 'EN' : 'हि'}</span>
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-white/80 dark:bg-earth-800/80 backdrop-blur-sm text-earth-700 dark:text-earth-300 hover:bg-white dark:hover:bg-earth-700 transition-colors shadow-sm"
        >
          {isDark ? <Sun className="w-5 h-5 text-saffron-500" /> : <Moon className="w-5 h-5 text-primary-600" />}
        </button>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-saffron-500 flex items-center justify-center shadow-warm-lg">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
              {t('profile.profileSetup')}
            </h1>
            <p className="text-earth-600 dark:text-earth-400">
              {t('profile.enterInfo')}
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white/80 dark:bg-earth-900/80 backdrop-blur-md rounded-3xl shadow-warm-lg dark:shadow-lg border border-cream-200 dark:border-earth-700 p-6 md:p-8 transition-colors duration-300">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Hindi */}
              <Input
                label={`${t('profile.fullName')} (हिंदी) *`}
                placeholder="उदाहरण: राम कुमार"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
              />

              {/* Name English */}
              <Input
                label={`${t('profile.fullName')} (English)`}
                placeholder="e.g., Ram Kumar"
                value={formData.nameEn}
                onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                leftIcon={<User className="w-5 h-5" />}
              />

              {/* Date of Birth */}
              <Input
                label={t('profile.dateOfBirth')}
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                leftIcon={<Calendar className="w-5 h-5" />}
                helperText={language === 'hi' ? 'जन्मदिन पर शुभकामनाएं भेजी जाएंगी' : 'Birthday wishes will be sent'}
              />

              {/* Ward */}
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                  {t('profile.ward')}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
                  <select
                    value={formData.ward}
                    onChange={(e) => {
                      const selected = wards.find(w => w.hi === e.target.value);
                      setFormData({ 
                        ...formData, 
                        ward: e.target.value,
                        wardEn: selected ? selected.en : ''
                      });
                    }}
                    className="input-field pl-10 appearance-none cursor-pointer"
                  >
                    <option value="">{t('profile.selectWard')}</option>
                    {wards.map((ward) => (
                      <option key={ward.hi} value={ward.hi}>
                        {language === 'en' ? ward.en : ward.hi}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Phone Display */}
              <div className="p-4 bg-cream-50 dark:bg-earth-800 rounded-xl border border-cream-200 dark:border-earth-700">
                <p className="text-sm text-earth-500 dark:text-earth-400">{t('login.mobileNumber')}</p>
                <p className="font-medium text-earth-900 dark:text-cream-100">+91 {user?.phone}</p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                loading={loading}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {t('common.continue')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileSetup;
