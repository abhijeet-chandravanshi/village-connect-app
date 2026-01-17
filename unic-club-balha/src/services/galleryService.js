// Gallery Service - Gallery image management API calls
import api from './api';

export const galleryService = {
  // Get all gallery images
  getAll: async () => {
    const response = await api.get('/gallery');
    return response.data;
  },
  
  // Get all gallery images with pagination
  getAllPageable: async (page = 0, size = 12) => {
    const response = await api.get('/gallery/pageable', {
      params: { page, size }
    });
    return response.data;
  },
  
  // Get gallery images by year
  getByYear: async (year) => {
    const response = await api.get(`/gallery/year/${year}`);
    return response.data;
  },
  
  // Get gallery images by year with pagination
  getByYearPageable: async (year, page = 0, size = 12) => {
    const response = await api.get(`/gallery/year/${year}/pageable`, {
      params: { page, size }
    });
    return response.data;
  },
  
  // Get gallery images by festival
  getByFestival: async (festivalId) => {
    const response = await api.get(`/gallery/festival/${festivalId}`);
    return response.data;
  },
  
  // Get gallery images by festival with pagination
  getByFestivalPageable: async (festivalId, page = 0, size = 12) => {
    const response = await api.get(`/gallery/festival/${festivalId}/pageable`, {
      params: { page, size }
    });
    return response.data;
  },
  
  // Get distinct years with gallery images
  getYears: async () => {
    const response = await api.get('/gallery/years');
    return response.data;
  },
  
  // Get gallery image by ID
  getById: async (id) => {
    const response = await api.get(`/gallery/${id}`);
    return response.data;
  },
  
  // Create gallery image record (Admin only)
  create: async (galleryData) => {
    const response = await api.post('/gallery', galleryData);
    return response.data;
  },
  
  // Delete gallery image (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/gallery/${id}`);
    return response.success;
  },
};

export default galleryService;
