import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { Card, Badge, Button, Modal } from '../../components/ui';
import { 
  ArrowLeft,
  Users,
  Search,
  Shield,
  Phone,
  Calendar,
  MapPin
} from 'lucide-react';
import toast from 'react-hot-toast';
import { users, formatDate } from '../../data/mockData';

function ManageMembers() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(false);

  const filteredUsers = users.filter(u => {
    const searchName = language === 'en' ? (u.nameEn || u.name) : u.name;
    return searchName.toLowerCase().includes(searchQuery.toLowerCase()) ||
           u.phone.includes(searchQuery);
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="primary">{t('profile.superAdmin')}</Badge>;
      case 'admin':
        return <Badge variant="saffron">{t('profile.admin')}</Badge>;
      default:
        return <Badge variant="leaf">{t('profile.member')}</Badge>;
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(t('admin.roleUpdated'));
    setLoading(false);
    setSelectedMember(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          {t('admin.manageMembers')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('admin.membersListAndRoles')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-earth-900 dark:text-cream-100">
              {users.length}
            </p>
            <p className="text-sm text-earth-500 dark:text-earth-400">{t('admin.totalMembers')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-saffron-600 dark:text-saffron-400">
              {users.filter(u => u.role === 'admin').length}
            </p>
            <p className="text-sm text-earth-500 dark:text-earth-400">{t('admin.admins')}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              {users.filter(u => u.role === 'super_admin').length}
            </p>
            <p className="text-sm text-earth-500 dark:text-earth-400">{t('profile.superAdmin')}</p>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
            <input
              type="text"
              placeholder={`${t('common.search')} ${t('common.nameOrPhone')}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Members List */}
      <Card>
        <div className="divide-y divide-cream-100 dark:divide-earth-700">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((member) => {
              const memberName = language === 'en' ? (member.nameEn || member.name) : member.name;
              return (
                <div 
                  key={member.id} 
                  className="p-4 flex items-center justify-between hover:bg-cream-50 dark:hover:bg-earth-800/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-lg">
                      {memberName[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-earth-900 dark:text-cream-100">
                        {memberName}
                      </h3>
                      <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        +91 {member.phone}
                      </p>
                    </div>
                  </div>
                  {getRoleBadge(member.role)}
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center">
              <Users className="w-16 h-16 mx-auto text-earth-300 dark:text-earth-600 mb-4" />
              <p className="text-earth-500 dark:text-earth-400 text-lg">
                {t('admin.noMembersFound')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Member Detail Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={t('admin.memberDetails')}
        size="md"
      >
        {selectedMember && (
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4 p-4 bg-cream-50 dark:bg-earth-800 rounded-xl">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-2xl">
                {(language === 'en' ? (selectedMember.nameEn || selectedMember.name) : selectedMember.name)[0]}
              </div>
              <div>
                <h3 className="font-semibold text-xl text-earth-900 dark:text-cream-100">
                  {language === 'en' ? (selectedMember.nameEn || selectedMember.name) : selectedMember.name}
                </h3>
                {getRoleBadge(selectedMember.role)}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-earth-600 dark:text-earth-400">
                <Phone className="w-5 h-5" />
                <span>+91 {selectedMember.phone}</span>
              </div>
              {selectedMember.dateOfBirth && (
                <div className="flex items-center gap-3 text-earth-600 dark:text-earth-400">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(selectedMember.dateOfBirth)}</span>
                </div>
              )}
              {selectedMember.ward && (
                <div className="flex items-center gap-3 text-earth-600 dark:text-earth-400">
                  <MapPin className="w-5 h-5" />
                  <span>{language === 'en' ? (selectedMember.wardEn || selectedMember.ward) : selectedMember.ward}</span>
                </div>
              )}
            </div>

            {/* Role Management */}
            <div className="pt-4 border-t border-cream-100 dark:border-earth-700">
              <p className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                {t('admin.changeRole')}
              </p>
              <div className="flex gap-2">
                <Button
                  variant={selectedMember.role === 'user' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleRoleChange(selectedMember.id, 'user')}
                  loading={loading}
                >
                  {t('profile.member')}
                </Button>
                <Button
                  variant={selectedMember.role === 'admin' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleRoleChange(selectedMember.id, 'admin')}
                  loading={loading}
                >
                  {t('profile.admin')}
                </Button>
                <Button
                  variant={selectedMember.role === 'super_admin' ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => handleRoleChange(selectedMember.id, 'super_admin')}
                  loading={loading}
                >
                  {t('profile.superAdmin')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default ManageMembers;
