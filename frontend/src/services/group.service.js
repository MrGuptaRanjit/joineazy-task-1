import api from './api';

export const groupService = {
  async getMyGroup() {
    const response = await api.get('/groups/my');
    return response.data; // { id, name, members: [...] } or null
  },

  async createGroup(name) {
    const response = await api.post('/groups', { name });
    return response.data; // { id, name, members: [...] }
  },

  async getGroupById(id) {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  async getAllGroups() {
    const response = await api.get('/groups');
    return response.data;
  },

  async addMember(groupId, identifier) {
    const response = await api.post(`/groups/${groupId}/members`, { identifier });
    return response.data; // updated members list
  },

  async removeMember(groupId, userId) {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data; // updated members list
  },
};
