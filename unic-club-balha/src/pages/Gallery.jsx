import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Card, Modal, Button } from '../components/ui';
import { 
  Image as ImageIcon, 
  X, 
  Download, 
  Calendar,
  SlidersHorizontal,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { galleryService, festivalService } from '../services';

function Gallery() {
  const { t, language } = useLanguage();
  const { useBackend } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [yearFilter, setYearFilter] = useState('all');
  const [festivalFilter, setFestivalFilter] = useState('all');
  const [galleryImages, setGalleryImages] = useState([]);
  const [festivals, setFestivals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Fetch gallery images and festivals
  useEffect(() => {
    fetchData();
  }, [useBackend, currentPage, yearFilter, festivalFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (useBackend) {
        // Try to fetch from API with pagination
        try {
          const festivalsData = await festivalService.getAll();
          setFestivals(festivalsData || []);
          
          let imagesResponse;
          if (festivalFilter !== 'all') {
            // Fetch by festival with pagination
            imagesResponse = await galleryService.getByFestivalPageable(festivalFilter, currentPage, pageSize);
          } else if (yearFilter !== 'all') {
            // Fetch by year with pagination
            imagesResponse = await galleryService.getByYearPageable(parseInt(yearFilter), currentPage, pageSize);
          } else {
            // Fetch all with pagination
            imagesResponse = await galleryService.getAllPageable(currentPage, pageSize);
          }
          
          setGalleryImages(imagesResponse.content || []);
          setTotalPages(imagesResponse.totalPages || 0);
          setTotalElements(imagesResponse.totalElements || 0);
        } catch (apiError) {
          console.log('API call failed, using mock data:', apiError);
          // Fall back to mock data if API not available
          const mockData = await import('../data/mockData');
          setGalleryImages(mockData.galleryImages);
          setFestivals(mockData.festivals);
          setTotalPages(1);
          setTotalElements(mockData.galleryImages.length);
        }
      } else {
        // Use mock data
        const mockData = await import('../data/mockData');
        setGalleryImages(mockData.galleryImages);
        setFestivals(mockData.festivals);
        setTotalPages(1);
        setTotalElements(mockData.galleryImages.length);
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
      // Fallback to mock data on any error
      const mockData = await import('../data/mockData');
      setGalleryImages(mockData.galleryImages);
      setFestivals(mockData.festivals);
      setTotalPages(1);
      setTotalElements(mockData.galleryImages.length);
    } finally {
      setLoading(false);
    }
  };

  const years = [...new Set(festivals.map(f => f.year))].sort((a, b) => b - a);
  
  // Reset to first page when filters change
  const handleYearFilterChange = (year) => {
    setYearFilter(year);
    setCurrentPage(0);
  };
  
  const handleFestivalFilterChange = (festivalId) => {
    setFestivalFilter(festivalId);
    setCurrentPage(0);
  };

  const handleDownload = (imageUrl, caption) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${caption || 'image'}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Loading state
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
              onChange={(e) => handleYearFilterChange(e.target.value)}
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
              onChange={(e) => handleFestivalFilterChange(e.target.value)}
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
      {galleryImages.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((image) => (
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
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="text-white text-sm font-medium truncate">{image.caption}</p>
                  <p className="text-white/70 text-xs">{image.year}</p>
                </div>
              </div>
            </div>
          ))}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Card className="mt-6">
              <div className="p-4 flex items-center justify-between">
                {/* Page Info */}
                <div className="text-sm text-earth-600 dark:text-earth-400">
                  {language === 'hi' 
                    ? `पृष्ठ ${currentPage + 1} / ${totalPages} (कुल ${totalElements} छवियाँ)` 
                    : `Page ${currentPage + 1} of ${totalPages} (${totalElements} total images)`}
                </div>
                
                {/* Pagination Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    leftIcon={<ChevronLeft className="w-4 h-4" />}
                  >
                    {language === 'hi' ? 'पिछला' : 'Previous'}
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="hidden sm:flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i;
                      } else if (currentPage < 3) {
                        pageNum = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNum = totalPages - 5 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                            currentPage === pageNum
                              ? 'bg-primary-500 text-white'
                              : 'bg-cream-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-cream-200 dark:hover:bg-earth-600'
                          }`}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    {language === 'hi' ? 'अगला' : 'Next'}
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
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
