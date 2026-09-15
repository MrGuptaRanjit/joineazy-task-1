import api from './api';

export const submissionService = {
  async confirmSubmission(assignmentId, { is_confirmed = true }) {
    const response = await api.post(`/assignments/${assignmentId}/submission/confirm`, {
      is_confirmed,
    });
    return response.data; // { message, submission }
  },
};
