import api from './api';

export const assignmentService = {
  async getStudentAssignments() {
    const response = await api.get('/assignments');
    return response.data; // Array of assignments with is_submitted status
  },

  async getStudentAssignmentDetails(id) {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },
};
