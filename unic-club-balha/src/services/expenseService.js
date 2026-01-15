// Expense Service - Expense management API calls
import api from './api';

export const expenseService = {
  // Get all expenses
  getAll: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },
  
  // Get expenses by festival
  getByFestival: async (festivalId) => {
    const response = await api.get(`/expenses/festival/${festivalId}`);
    return response.data;
  },
  
  // Get total expense for a festival
  getTotalByFestival: async (festivalId) => {
    const response = await api.get(`/expenses/festival/${festivalId}/total`);
    return response.data?.totalExpense || 0;
  },
  
  // Get expense breakdown by category for a festival
  getBreakdownByFestival: async (festivalId) => {
    const response = await api.get(`/expenses/festival/${festivalId}/breakdown`);
    return response.data;
  },
  
  // Get expenses by category
  getByCategory: async (category) => {
    const response = await api.get(`/expenses/category/${category}`);
    return response.data;
  },
  
  // Get distinct categories
  getCategories: async () => {
    const response = await api.get('/expenses/categories');
    return response.data;
  },
  
  // Get expense by ID
  getById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },
  
  // Create expense (Admin only)
  create: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },
  
  // Update expense (Admin only)
  update: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },
  
  // Delete expense (Admin only)
  delete: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.success;
  },
};

export default expenseService;
