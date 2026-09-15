const analyticsRepository = require('../repositories/analytics.repository');

class AnalyticsService {
  async getOverview() {
    return await analyticsRepository.getOverviewKPIs();
  }

  async getGroupAnalytics() {
    return await analyticsRepository.getGroupAnalytics();
  }

  async getStudentAnalytics() {
    return await analyticsRepository.getStudentAnalytics();
  }
}

module.exports = new AnalyticsService();
