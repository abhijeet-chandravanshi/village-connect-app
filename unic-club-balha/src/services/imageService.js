// Image Service - Cloudinary image upload API calls
import api from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Get stored token
const getToken = () => localStorage.getItem('unicclub_token');

/**
 * Image Service for Cloudinary uploads
 * 
 * For PUBLIC images (festivals, gallery, avatars) → Cloudinary
 * For PRIVATE images (payment proofs) → Database byte array
 */
export const imageService = {
  
  // ==================== CLOUDINARY (PUBLIC IMAGES) ====================
  
  /**
   * Upload general image to Cloudinary
   * @param {File} file - Image file to upload
   * @param {string} folder - Folder path (e.g., 'general', 'events')
   * @returns {Promise<{url, thumbnailUrl, publicId}>}
   */
  upload: async (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/images/upload?folder=${folder}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Image upload failed');
    }
    return data.data;
  },
  
  /**
   * Upload festival banner image
   * @param {File} file - Image file
   * @param {number} festivalId - Festival ID
   * @param {number} year - Festival year
   * @returns {Promise<{url, thumbnailUrl, publicId}>}
   */
  uploadFestivalImage: async (file, festivalId, year = new Date().getFullYear()) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(
      `${API_BASE_URL}/images/festival/${festivalId}?year=${year}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      }
    );
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Festival image upload failed');
    }
    return data.data;
  },
  
  /**
   * Upload gallery image
   * @param {File} file - Image file
   * @param {number} year - Year
   * @param {string} eventName - Event name for folder organization
   * @returns {Promise<{url, thumbnailUrl, publicId}>}
   */
  uploadGalleryImage: async (file, year = new Date().getFullYear(), eventName = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(
      `${API_BASE_URL}/images/gallery?year=${year}&eventName=${encodeURIComponent(eventName)}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
        body: formData,
      }
    );
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Gallery image upload failed');
    }
    return data.data;
  },
  
  /**
   * Upload user avatar
   * @param {File} file - Image file
   * @returns {Promise<{url, publicId}>}
   */
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/images/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Avatar upload failed');
    }
    return data.data;
  },
  
  /**
   * Delete image from Cloudinary (Admin only)
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<boolean>}
   */
  deleteImage: async (publicId) => {
    // Replace slashes with underscores for URL encoding
    const encodedPublicId = publicId.replace(/\//g, '_');
    const response = await api.delete(`/images/${encodedPublicId}`);
    return response.data?.deleted || false;
  },
  
  /**
   * Get transformed image URLs
   * @param {string} publicId - Cloudinary public ID
   * @param {number} width - Desired width
   * @param {number} height - Desired height
   * @returns {Promise<{optimized, thumbnail, placeholder}>}
   */
  getTransformedUrls: async (publicId, width = 800, height = 600) => {
    const response = await api.get(
      `/images/transform?publicId=${encodeURIComponent(publicId)}&width=${width}&height=${height}`
    );
    return response.data;
  },
  
  /**
   * Check if Cloudinary is configured
   * @returns {Promise<{configured, message}>}
   */
  checkStatus: async () => {
    try {
      const response = await api.get('/images/status');
      return response.data;
    } catch (error) {
      return { configured: false, message: 'Cloudinary service unavailable' };
    }
  },
  
  // ==================== PAYMENT PROOFS (PRIVATE - DATABASE) ====================
  
  /**
   * Upload payment proof for a contribution
   * Stored securely in database (not Cloudinary)
   * @param {number} contributionId - Contribution ID
   * @param {File} file - Image file
   * @returns {Promise<{contributionId, fileName, fileSize, contentType}>}
   */
  uploadPaymentProof: async (contributionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/contributions/${contributionId}/proof`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Payment proof upload failed');
    }
    return data.data;
  },
  
  /**
   * Get payment proof image URL
   * Only accessible by contribution owner or admin
   * @param {number} contributionId - Contribution ID
   * @returns {string} - URL to view the proof image
   */
  getPaymentProofUrl: (contributionId) => {
    return `${API_BASE_URL}/contributions/${contributionId}/proof`;
  },
  
  /**
   * Check if payment proof exists
   * @param {number} contributionId - Contribution ID
   * @returns {Promise<boolean>}
   */
  hasPaymentProof: async (contributionId) => {
    try {
      const response = await api.get(`/contributions/${contributionId}/proof/check`);
      return response.data?.hasProofImage || false;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Download payment proof
   * @param {number} contributionId - Contribution ID
   * @returns {Promise<Blob>}
   */
  downloadPaymentProof: async (contributionId) => {
    const response = await fetch(`${API_BASE_URL}/contributions/${contributionId}/proof/download`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to download payment proof');
    }
    
    return response.blob();
  },
};

export default imageService;
