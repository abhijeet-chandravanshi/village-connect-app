// API Service - Connects React Frontend to Java Backend
// Base configuration for all API calls

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Get stored token
const getToken = () => localStorage.getItem('unicclub_token');

// API request helper
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Handle 401 - Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('unicclub_token');
      localStorage.removeItem('unicclub_user');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API Methods
export const api = {
  // GET request
  get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),
  
  // POST request
  post: (endpoint, body) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }),
  
  // PUT request
  put: (endpoint, body) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }),
  
  // DELETE request
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
  
  // Upload file
  upload: async (endpoint, file, additionalData = {}) => {
    const token = getToken();
    const formData = new FormData();
    formData.append('file', file);
    
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    
    return response.json();
  },
};

export default api;


