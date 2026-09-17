import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Award,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';

const COLORS = ['#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899'];

export default function AdminAnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [groupAnalytics, setGroupAnalytics] = useState([]);
  const [studentAnalytics, setStudentAnalytics] = useState([]);
  const [assignmentAnalytics, setAssignmentAnalytics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [overviewData, groupData, studentData, assignmentsData] = await Promise.all([
        adminService.getAnalyticsOverview(),
        adminService.getGroupAnalytics(),
        adminService.getStudentAnalytics(),
        adminService.getAssignments(),
      ]);

      setOverview(overviewData);
      setGroupAnalytics(groupData);
      setStudentAnalytics(studentData);
      setAssignmentAnalytics(assignmentsData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load executive analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner size="lg" text="Calculating real-time classroom analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time assignment completion and classroom performance data
          </p>
        </div>
        <ErrorAlert
          title="Failed to Load Analytics"
          message={error}
          onRetry={fetchAnalytics}
        />
      </div>
    );
  }

  // Calculate submission distribution
  const completedSubs = Number(overview?.completed_submissions || 0);
  const pendingSubs = Number(overview?.pending_submissions || 0);
  const totalSubsExpectation = completedSubs + pendingSubs;

  const distributionData = [
    { name: 'Completed Submissions', value: completedSubs, color: '#10B981' },
    { name: 'Pending Confirmations', value: pendingSubs, color: '#F59E0B' },
  ];

  // Prepare assignment completion chart data
  const assignmentChartData = assignmentAnalytics.map((item) => ({
    name: item.title.length > 18 ? item.title.substring(0, 18) + '...' : item.title,
    fullName: item.title,
    rate: Math.round(Number(item.completion_rate || 0)),
    submissions: Number(item.submission_count || 0),
    totalTargeted: Number(item.total_targeted || 0),
  }));

  // Prepare group performance chart data
  const groupChartData = groupAnalytics.map((item) => ({
    name: item.group_name.length > 16 ? item.group_name.substring(0, 16) + '...' : item.group_name,
    fullName: item.group_name,
    rate: Math.round(Number(item.completion_rate || 0)),
    members: Number(item.member_count || 0),
  }));

  const overallRate = overview ? Math.round(Number(overview.overall_completion_rate || 0)) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Executive Analytics</h1>
            <Badge variant="primary" size="md">
              Live Database Aggregates
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time aggregation of student submissions, group cohorts, and assignment completion
          </p>
        </div>
      </div>

      {/* Summary Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</p>
            <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center text-brand-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overview?.total_students || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Registered students</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Groups</p>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overview?.total_groups || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Collaborative cohorts</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Assignments</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overview?.total_assignments || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Active tasks</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Confirmed Subs</p>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{completedSubs}</p>
          <p className="text-xs text-slate-500 mt-1">Two-step certified</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Rate</p>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{overallRate}%</p>
          <div className="mt-2">
            <ProgressBar percentage={overallRate} size="xs" />
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignment Completion Bar Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-semibold text-white">Assignment Completion Rates</h2>
            </div>
            <span className="text-xs text-slate-500">Percentage completed</span>
          </div>

          {assignmentChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
              <p className="text-xs text-slate-500">No assignment data available to chart.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assignmentChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                            <p className="font-semibold text-white mb-1">{data.fullName}</p>
                            <p className="text-emerald-400">Completion: {data.rate}%</p>
                            <p className="text-slate-400">
                              Submissions: {data.submissions} / {data.totalTargeted} students
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {assignmentChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rate === 100 ? '#10B981' : entry.rate > 50 ? '#0284C7' : '#F59E0B'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Group Performance Comparison Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-semibold text-white">Group Performance Cohorts</h2>
            </div>
            <span className="text-xs text-slate-500">Group average rate</span>
          </div>

          {groupChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
              <p className="text-xs text-slate-500">No group performance data to chart.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={groupChartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-xl text-xs">
                            <p className="font-semibold text-white mb-1">{data.fullName}</p>
                            <p className="text-brand-400">Cohort Completion: {data.rate}%</p>
                            <p className="text-slate-400">Group Size: {data.members} members</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="rate" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Submission Distribution Pie Chart */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Submission Status Distribution</h2>
            </div>
            <span className="text-xs text-slate-500">Total expectation: {totalSubsExpectation}</span>
          </div>

          {totalSubsExpectation === 0 ? (
            <div className="h-64 flex items-center justify-center border border-dashed border-slate-800 rounded-lg">
              <p className="text-xs text-slate-500">No submissions have been targeted yet.</p>
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-slate-800 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs">
                            <span className="font-semibold text-white">{data.name}: </span>
                            <span className="text-brand-400 font-bold">{data.value}</span>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Top Performing Cohorts Summary Box */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-semibold text-white">Cohort Progress Highlights</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-time synchronization ensures professors have accurate transparency over student accountability.
            </p>

            <div className="space-y-3.5">
              {groupAnalytics.slice(0, 3).map((group) => {
                const rate = Math.round(Number(group.completion_rate || 0));
                return (
                  <div key={group.group_id} className="p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-white">{group.group_name}</span>
                      <span className="font-medium text-emerald-400">{rate}% Complete</span>
                    </div>
                    <ProgressBar percentage={rate} size="xs" />
                  </div>
                );
              })}
              {groupAnalytics.length === 0 && (
                <p className="text-xs text-slate-500 italic">No groups formed yet.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Aggregated with zero mock data</span>
            <span className="text-brand-400 font-mono">MongoDB Atlas</span>
          </div>
        </div>
      </div>

      {/* Student Performance Roster Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-brand-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Individual Student Roster & Performance</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Per-student submission metrics across all eligible coursework
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {studentAnalytics.length} Enrolled Students
          </span>
        </div>

        {studentAnalytics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-sm text-slate-500">No student records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950/60 text-xs text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-6">Student</th>
                  <th className="py-3 px-6">Student ID</th>
                  <th className="py-3 px-6">Group</th>
                  <th className="py-3 px-6">Submissions</th>
                  <th className="py-3 px-6">Completion Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {studentAnalytics.map((student) => {
                  const rate = Math.round(Number(student.completion_rate || 0));
                  return (
                    <tr key={student.user_id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-white">
                        <div>
                          <span>{student.name}</span>
                          <p className="text-xs text-slate-400 font-mono">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-slate-300 font-mono text-xs">
                        {student.student_id || <span className="text-slate-500">N/A</span>}
                      </td>
                      <td className="py-3.5 px-6 text-slate-300 text-xs">
                        {student.group_name ? (
                          <span className="inline-flex items-center gap-1 text-slate-200">
                            <Layers className="w-3 h-3 text-indigo-400" />
                            {student.group_name}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">No group</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-300">
                        <span className="font-semibold text-emerald-400">{student.completed_submissions || 0}</span>
                        <span className="text-slate-500"> / {student.total_targeted || 0}</span>
                      </td>
                      <td className="py-3.5 px-6 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <ProgressBar percentage={rate} size="xs" className="w-20" />
                          <span className="text-xs font-semibold text-white">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
