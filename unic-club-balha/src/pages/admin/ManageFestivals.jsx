import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge, Button, Modal, Input } from '../../components/ui';
import { 
  ArrowLeft,
  Plus, 
  Edit2, 
  Trash2,
  Calendar,
  IndianRupee,
  Save,
  Loader2,
  Upload,
  Image as ImageIcon,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../../data/mockData';
import { festivalService, imageService } from '../../services';

function ManageFestivals() {
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFestival, setEditingFestival] = useState(null);
  const [loading, setLoading] = useState(false);
  const [festivals, setFestivals] = useState([]);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    description: '',
    startDate: '',
    endDate: '',
    expectedBudget: '',
    status: 'upcoming',
    imageUrl: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Fetch festivals from backend
  useEffect(() => {
    fetchFestivals();
  }, [useBackend]);

  const fetchFestivals = async () => {
    try {
      if (useBackend) {
        const data = await festivalService.getAll();
        setFestivals(data || []);
      } else {
        // Fallback to mock data
        const { festivals: mockFestivals } = await import('../../data/mockData');
        setFestivals(mockFestivals);
      }
    } catch (error) {
      console.error('Error fetching festivals:', error);
      // Fallback to mock data on error
      const { festivals: mockFestivals } = await import('../../data/mockData');
      setFestivals(mockFestivals);
    } finally {
      setFetchingData(false);
    }
  };

  const handleOpenModal = (festival = null) => {
    if (festival) {
      setEditingFestival(festival);
      setFormData({
        name: festival.name,
        nameEn: festival.nameEn,
        description: festival.description || '',
        startDate: festival.startDate,
        endDate: festival.endDate || '',
        expectedBudget: (festival.expectedBudget || 0).toString(),
        status: festival.status?.toLowerCase() || 'upcoming',
        imageUrl: festival.imageUrl || festival.image || ''
      });
      // Set preview for existing image
      setImagePreview(festival.imageUrl || festival.image || null);
      setImageFile(null);
    } else {
      setEditingFestival(null);
      setFormData({
        name: '',
        nameEn: '',
        description: '',
        startDate: '',
        endDate: '',
        expectedBudget: '',
        status: 'upcoming',
        imageUrl: ''
      });
      setImageFile(null);
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} ${t('common.fileTooLarge')}`);
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(t('admin.invalidImageType'));
        return;
      }
      setImageFile(file);
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Clear selected image
  const handleClearImage = () => {
    if (imagePreview && imageFile) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(editingFestival?.imageUrl || editingFestival?.image || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.startDate) {
      toast.error(t('admin.fillRequiredFields'));
      return;
    }

    setLoading(true);
    try {
      // Upload image if a new file was selected
      let imageUrl = formData.imageUrl;
      if (imageFile && useBackend) {
        try {
          // Use Cloudinary for festival images
          const year = formData.startDate ? new Date(formData.startDate).getFullYear() : new Date().getFullYear();
          const uploadResponse = await imageService.upload(imageFile, `festivals/${year}`);
          if (uploadResponse?.url) {
            imageUrl = uploadResponse.url;
          }
        } catch (uploadError) {
          console.log('Cloudinary upload failed, checking if configured...', uploadError.message);
          // Check if Cloudinary is configured
          const status = await imageService.checkStatus();
          if (!status.configured) {
            toast.error('Cloudinary not configured. Using placeholder image.');
          }
          // Use placeholder image
          imageUrl = imagePreview || 'https://images.unsplash.com/photo-1574265040831-67b58fc79036?w=800';
        }
      } else if (imageFile && !useBackend) {
        // Mock mode: use the local preview or a default image
        imageUrl = imagePreview || 'https://images.unsplash.com/photo-1574265040831-67b58fc79036?w=800';
      }

      const festivalData = {
        name: formData.name,
        nameEn: formData.nameEn || formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        expectedBudget: parseFloat(formData.expectedBudget) || 0,
        status: formData.status.toUpperCase(),
        year: new Date(formData.startDate).getFullYear(),
        imageUrl: imageUrl || null
      };

      if (useBackend) {
        if (editingFestival) {
          await festivalService.update(editingFestival.id, festivalData);
          toast.success(t('admin.festivalUpdated'));
        } else {
          await festivalService.create(festivalData);
          toast.success(t('admin.festivalAdded'));
        }
        // Refresh the list
        await fetchFestivals();
      } else {
        // Mock implementation
        if (editingFestival) {
          toast.success(t('admin.festivalUpdated'));
        } else {
          toast.success(t('admin.festivalAdded'));
        }
      }
      
      // Clean up preview URL
      if (imageFile && imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImageFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving festival:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.deleteFestivalConfirm'))) {
      return;
    }
    try {
      if (useBackend) {
        await festivalService.delete(id);
        await fetchFestivals();
      }
      toast.success(t('admin.festivalDeleted'));
    } catch (error) {
      console.error('Error deleting festival:', error);
      toast.error(error.message || t('common.error'));
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
            {t('admin.manageFestivals')}
          </h1>
          <p className="text-earth-600 dark:text-earth-400">
            {t('admin.addEditFestivalsActivities')}
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t('admin.newFestival')}
        </Button>
      </div>

      {/* Festivals List */}
      <div className="space-y-4">
        {festivals.map((festival) => (
          <Card key={festival.id}>
            <div className="p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <img 
                    src={festival.imageUrl || festival.image || 'https://images.unsplash.com/photo-1574265040831-67b58fc79036?w=800'} 
                    alt={festival.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-earth-900 dark:text-cream-100">
                        {language === 'en' ? festival.nameEn : festival.name}
                      </h3>
                      <Badge variant={festival.status} size="sm">
                        {festival.status === 'upcoming' ? t('festivals.upcoming') : 
                         festival.status === 'ongoing' ? t('festivals.ongoing') : t('festivals.completed')}
                      </Badge>
                    </div>
                    <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {festival.startDate} • {festival.year}
                    </p>
                    <p className="text-sm text-earth-500 dark:text-earth-400 flex items-center gap-1 mt-1">
                      <IndianRupee className="w-4 h-4" />
                      {t('festivals.budget')}: {formatCurrency(festival.expectedBudget)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleOpenModal(festival)}
                    leftIcon={<Edit2 className="w-4 h-4" />}
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(festival.id)}
                    leftIcon={<Trash2 className="w-4 h-4" />}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFestival ? t('admin.editFestival') : t('admin.addNewFestival')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={`${t('admin.nameHindi')} *`}
              placeholder="उदा: दीपावली"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label={t('admin.nameEnglish')}
              placeholder="e.g., Diwali"
              value={formData.nameEn}
              onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
              {t('admin.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.aboutFestival')}
              className="input-field min-h-[80px]"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={`${t('admin.startDate')} *`}
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
            <Input
              label={t('admin.endDate')}
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={t('festivals.budget')}
              type="number"
              placeholder="50000"
              value={formData.expectedBudget}
              onChange={(e) => setFormData({ ...formData, expectedBudget: e.target.value })}
              leftIcon={<IndianRupee className="w-5 h-5" />}
            />
            <div>
              <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                {t('common.status')}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="input-field"
              >
                <option value="upcoming">{t('festivals.upcoming')}</option>
                <option value="ongoing">{t('festivals.ongoing')}</option>
                <option value="completed">{t('festivals.completed')}</option>
              </select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
              {t('admin.festivalImage')}
            </label>
            
            {imagePreview ? (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Festival preview" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <span className="px-3 py-1.5 bg-white/90 dark:bg-earth-800/90 text-earth-700 dark:text-earth-300 text-sm rounded-lg hover:bg-white dark:hover:bg-earth-700 transition-colors">
                    {t('admin.changeImage')}
                  </span>
                </label>
              </div>
            ) : (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-cream-300 dark:border-earth-600 rounded-xl p-8 text-center hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                  <ImageIcon className="w-12 h-12 mx-auto text-earth-400 mb-2" />
                  <p className="font-medium text-earth-700 dark:text-earth-300">
                    {t('admin.clickToUploadImage')}
                  </p>
                  <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                    PNG, JPG (max 5MB)
                  </p>
                </div>
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-cream-100 dark:border-earth-700">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              className="flex-1"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftIcon={<Save className="w-4 h-4" />}
              className="flex-1"
            >
              {t('common.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ManageFestivals;
