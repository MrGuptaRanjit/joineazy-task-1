import api from './api';

export const adminService = {
  // Assignments Management
  async getAssignments() {
    const response = await api.get('/admin/assignments');
    return response.data;
  },

  async getAssignmentById(id) {
    const response = await api.get(`/admin/assignments/${id}`);
    return response.data;
  },

  async createAssignment(data) {
    const response = await api.post('/admin/assignments', data);
    return response.data;
  },

  async updateAssignment(id, data) {
    const response = await api.put(`/admin/assignments/${id}`, data);
    return response.data;
  },

  async deleteAssignment(id) {
    const response = await api.delete(`/admin/assignments/${id}`);
    return response.data;
  },

  async getAssignmentSubmissions(id) {
    const response = await api.get(`/admin/assignments/${id}/submissions`);
    return response.data;
  },

  // Groups Monitoring
  async getAllGroups() {
    const response = await api.get('/groups');
    return response.data;
  },

  async getGroupById(id) {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  async getGroupAudit(id) {
    const response = await api.get(`/admin/groups/${id}/audit`);
    return response.data;
  },

  // Analytics Engine
  async getOverviewAnalytics() {
    const response = await api.get('/admin/analytics/overview');
    return response.data;
  },

  async getGroupAnalytics() {
    const response = await api.get('/admin/analytics/groups');
    return response.data;
  },

  async getStudentAnalytics() {
    const response = await api.get('/admin/analytics/students');
    return response.data;
  },
};
