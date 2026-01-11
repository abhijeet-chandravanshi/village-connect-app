import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, Button, Input, Badge, Modal } from '../components/ui';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Edit2, 
  LogOut,
  Save,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [nameEn, setNameEn] = useState(user?.nameEn || '');
  const [ward, setWard] = useState(user?.ward || '');
  const [wardEn, setWardEn] = useState(user?.wardEn || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth || '');
  const [loading, setLoading] = useState(false);

  const displayName = language === 'en' ? (user?.nameEn || user?.name) : user?.name;
  const displayWard = language === 'en' ? (user?.wardEn || user?.ward) : user?.ward;

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateProfile({ name, nameEn, ward, wardEn, dateOfBirth });
      toast.success(t('profile.profileUpdated'));
      setEditMode(false);
    } catch (error) {
      toast.error(t('common.updateFailed'));
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'super_admin':
        return <Badge variant="primary">{t('profile.superAdmin')}</Badge>;
      case 'admin':
        return <Badge variant="saffron">{t('profile.admin')}</Badge>;
      default:
        return <Badge variant="leaf">{t('profile.member')}</Badge>;
    }
  };

  const wards = [
    { hi: 'वार्ड 1', en: 'Ward 1' },
    { hi: 'वार्ड 2', en: 'Ward 2' },
    { hi: 'वार्ड 3', en: 'Ward 3' },
    { hi: 'मोहल्ला पूर्व', en: 'East Mohalla' },
    { hi: 'मोहल्ला पश्चिम', en: 'West Mohalla' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
          {t('profile.myProfile')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('common.viewAndUpdate')}
        </p>
      </div>

      {/* Profile Card */}
      <Card className="mb-6">
        <div className="p-4 md:p-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-saffron-400 flex items-center justify-center text-white text-3xl font-bold shadow-warm">
              {displayName?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-earth-900 dark:text-cream-100">
                {displayName || t('profile.fullName')}
              </h2>
              {getRoleBadge()}
            </div>
          </div>

          {/* Info Grid */}
          <div className="space-y-4">
            {/* Phone */}
            <div className="flex items-center gap-3 p-3 bg-cream-50 dark:bg-earth-800 rounded-xl">
              <Phone className="w-5 h-5 text-earth-400" />
              <div>
                <p className="text-sm text-earth-500 dark:text-earth-400">{t('profile.cannotChangeMobile')}</p>
                <p className="font-medium text-earth-900 dark:text-cream-100">+91 {user?.phone}</p>
              </div>
            </div>

            {/* Ward */}
            {displayWard && (
              <div className="flex items-center gap-3 p-3 bg-cream-50 dark:bg-earth-800 rounded-xl">
                <MapPin className="w-5 h-5 text-earth-400" />
                <div>
                  <p className="text-sm text-earth-500 dark:text-earth-400">{t('profile.ward')}</p>
                  <p className="font-medium text-earth-900 dark:text-cream-100">{displayWard}</p>
                </div>
              </div>
            )}

            {/* Date of Birth */}
            {user?.dateOfBirth && (
              <div className="flex items-center gap-3 p-3 bg-cream-50 dark:bg-earth-800 rounded-xl">
                <Calendar className="w-5 h-5 text-earth-400" />
                <div>
                  <p className="text-sm text-earth-500 dark:text-earth-400">{t('profile.dateOfBirth')}</p>
                  <p className="font-medium text-earth-900 dark:text-cream-100">
                    {user.dateOfBirth 
                      ? new Date(user.dateOfBirth).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })
                      : '-'}
                  </p>
                </div>
              </div>
            )}

            {/* Role */}
            <div className="flex items-center gap-3 p-3 bg-cream-50 dark:bg-earth-800 rounded-xl">
              <Shield className="w-5 h-5 text-earth-400" />
              <div>
                <p className="text-sm text-earth-500 dark:text-earth-400">{t('profile.role')}</p>
                <div className="mt-1">{getRoleBadge()}</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="secondary"
              onClick={() => setEditMode(true)}
              leftIcon={<Edit2 className="w-4 h-4" />}
              className="flex-1"
            >
              {t('profile.editProfile')}
            </Button>
            <Button
              variant="danger"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="flex-1"
            >
              {t('profile.logout')}
            </Button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={editMode}
        onClose={() => setEditMode(false)}
        title={t('profile.editProfile')}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label={`${t('profile.fullName')} (हिंदी)`}
            placeholder="अपना नाम दर्ज करें"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<User className="w-5 h-5" />}
          />
          
          <Input
            label={`${t('profile.fullName')} (English)`}
            placeholder="Enter your name"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            leftIcon={<User className="w-5 h-5" />}
          />

          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
              {t('profile.ward')}
            </label>
            <select
              value={ward}
              onChange={(e) => {
                const selected = wards.find(w => w.hi === e.target.value);
                setWard(e.target.value);
                if (selected) setWardEn(selected.en);
              }}
              className="input-field"
            >
              <option value="">{t('profile.selectWard')}</option>
              {wards.map((w) => (
                <option key={w.hi} value={w.hi}>
                  {language === 'en' ? w.en : w.hi}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={t('profile.dateOfBirth')}
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            leftIcon={<Calendar className="w-5 h-5" />}
          />

          <div className="flex gap-3 pt-4 border-t border-cream-100 dark:border-earth-700">
            <Button
              variant="secondary"
              onClick={() => setEditMode(false)}
              leftIcon={<X className="w-4 h-4" />}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              onClick={handleSave}
              loading={loading}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Profile;
