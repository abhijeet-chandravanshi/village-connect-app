import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input } from '../../components/ui';
import { 
  ArrowLeft,
  Upload, 
  X,
  Image as ImageIcon,
  CheckCircle,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { festivalService, imageService } from '../../services';

function UploadPhotos() {
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [selectedFestival, setSelectedFestival] = useState('');
  const [caption, setCaption] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [festivals, setFestivals] = useState([]);
  const [fetchingFestivals, setFetchingFestivals] = useState(true);

  // Fetch festivals from backend
  useEffect(() => {
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
        setFetchingFestivals(false);
      }
    };
    
    fetchFestivals();
  }, [useBackend]);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} ${t('common.fileTooLarge')}`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name
    }));

    setImages([...images, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    URL.revokeObjectURL(newImages[index].preview);
    newImages.splice(index, 1);
    setImages(newImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFestival) {
      toast.error(t('admin.selectFestivalRequired'));
      return;
    }
    if (images.length === 0) {
      toast.error(t('admin.selectPhotosRequired'));
      return;
    }

    setLoading(true);
    try {
      if (useBackend) {
        // Get selected festival details for year and event name
        const festival = festivals.find(f => f.id.toString() === selectedFestival.toString());
        const year = festival?.year || new Date().getFullYear();
        const eventName = festival?.nameEn || festival?.name || 'general';

        // Upload each image to Cloudinary via backend
        let successCount = 0;
        let failCount = 0;

        for (const img of images) {
          try {
            await imageService.uploadGalleryImage(img.file, year, eventName);
            successCount++;
          } catch (uploadError) {
            console.error('Error uploading image:', img.name, uploadError);
            failCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`${successCount} ${t('admin.photosUploaded')}`);
          setUploadSuccess(true);
        }
        if (failCount > 0) {
          toast.error(`${failCount} ${t('admin.photosFailedToUpload')}`);
        }
      } else {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success(t('admin.uploadSuccess'));
        setUploadSuccess(true);
      }
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error(error.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFestival('');
    setCaption('');
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setUploadSuccess(false);
  };

  // Loading state for festivals
  if (fetchingFestivals) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
        <p className="text-earth-500 dark:text-earth-400 mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          {t('admin.uploadPhotos')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('admin.addPhotosToGallery')}
        </p>
      </div>

      {uploadSuccess ? (
        <Card>
          <div className="py-12 text-center p-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-leaf-100 dark:bg-leaf-900/40 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-leaf-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
              {t('admin.uploadSuccess')}
            </h2>
            <p className="text-earth-600 dark:text-earth-400 mb-6">
              {images.length} {t('admin.photosAdded')}
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/gallery">
                <Button variant="secondary">
                  {t('gallery.title')}
                </Button>
              </Link>
              <Button onClick={handleReset}>
                {t('admin.uploadMore')}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="p-4 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Festival Selection */}
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                  {t('admin.selectFestival')} *
                </label>
                <select
                  value={selectedFestival}
                  onChange={(e) => setSelectedFestival(e.target.value)}
                  className="input-field"
                >
                  <option value="">{t('admin.selectFestival')}...</option>
                  {festivals.map((festival) => (
                    <option key={festival.id} value={festival.id}>
                      {language === 'en' ? festival.nameEn : festival.name} ({festival.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* Caption */}
              <Input
                label={`${t('admin.caption')} (${t('common.optional')})`}
                placeholder={t('admin.aboutFestival')}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />

              {/* Upload Area */}
              <div>
                <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-1.5">
                  {t('admin.selectPhotos')} *
                </label>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <div className="border-2 border-dashed border-cream-300 dark:border-earth-600 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                    <Upload className="w-12 h-12 mx-auto text-earth-400 mb-2" />
                    <p className="font-medium text-earth-700 dark:text-earth-300">
                      {t('common.clickToUpload')}
                    </p>
                    <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                      PNG, JPG (max 5MB each)
                    </p>
                  </div>
                </label>
              </div>

              {/* Preview Grid */}
              {images.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
                    {t('admin.selectedPhotos')} ({images.length})
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {images.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img.preview}
                          alt={img.name}
                          className="w-full aspect-square object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="submit"
                loading={loading}
                className="w-full"
                leftIcon={<Upload className="w-4 h-4" />}
                disabled={images.length === 0 || !selectedFestival}
              >
                {t('admin.uploadPhotos')} ({images.length})
              </Button>
            </form>
          </div>
        </Card>
      )}
    </div>
  );
}

export default UploadPhotos;
