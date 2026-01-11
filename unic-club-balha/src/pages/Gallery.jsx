import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Card, Modal, Button } from '../components/ui';
import { 
  Image as ImageIcon, 
  X, 
  Download, 
  Calendar,
  SlidersHorizontal 
} from 'lucide-react';
import { galleryImages, festivals } from '../data/mockData';

function Gallery() {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [festivalFilter, setFestivalFilter] = useState('all');

  const years = [...new Set(galleryImages.map(img => img.year))].sort((a, b) => b - a);

  const filteredImages = galleryImages.filter(img => {
    const matchYear = yearFilter === 'all' || img.year.toString() === yearFilter;
    const matchFestival = festivalFilter === 'all' || img.festivalId === festivalFilter;
    return matchYear && matchFestival;
  });

  const handleDownload = (imageUrl, caption) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${caption || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
          {t('gallery.title')}
        </h1>
        <p className="text-earth-600 dark:text-earth-400">
          {t('gallery.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
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

          {/* Festival Filter */}
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-earth-400" />
            <select
              value={festivalFilter}
              onChange={(e) => setFestivalFilter(e.target.value)}
              className="input-field"
            >
              <option value="all">{t('common.all')} {t('nav.festivals')}</option>
              {festivals.map((festival) => (
                <option key={festival.id} value={festival.id}>
                  {language === 'en' ? festival.nameEn : festival.name} ({festival.year})
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Image Grid */}
      {filteredImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="relative group cursor-pointer overflow-hidden rounded-2xl shadow-soft hover:shadow-warm transition-shadow"
              onClick={() => setSelectedImage(image)}
            >
              <div className="aspect-square">
                <img
                  src={image.imageUrl}
                  alt={image.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">{image.caption}</p>
                  <p className="text-white/70 text-xs">{image.year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="py-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-earth-300 dark:text-earth-600 mb-4" />
            <p className="text-earth-500 dark:text-earth-400 text-lg">
              {t('gallery.noPhotos')}
            </p>
          </div>
        </Card>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="xl"
      >
        {selectedImage && (
          <div className="relative">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 z-10 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <img
              src={selectedImage.imageUrl}
              alt={selectedImage.caption}
              className="w-full max-h-[70vh] object-contain rounded-xl"
            />

            {/* Info & Download */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-earth-900 dark:text-cream-100">
                  {selectedImage.caption}
                </p>
                <p className="text-sm text-earth-500 dark:text-earth-400">
                  {selectedImage.festivalName} • {selectedImage.year}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.caption)}
                leftIcon={<Download className="w-4 h-4" />}
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Gallery;
