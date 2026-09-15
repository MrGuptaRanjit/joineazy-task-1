import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CheckCircle2,
  Clock,
  TrendingUp,
  PlusCircle,
  ExternalLink,
  ArrowRight,
  Shield,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewData, assignmentsData] = await Promise.all([
        adminService.getOverviewAnalytics(),
        adminService.getAssignments(),
      ]);
      setOverview(overviewData);
      setAssignments(assignmentsData || []);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
      setError('Unable to load executive metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Aggregating academic cohort metrics..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Dashboard Error"
        description={error}
        actionLabel="Retry"
        onAction={fetchData}
      />
    );
  }

  const upcomingDeadlines = [...assignments]
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 4);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Faculty Executive Dashboard</h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time coursework distribution, submission tracking, and cohort completion analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/assignments/new">
            <Button variant="primary" size="md" icon={PlusCircle}>
              Create Assignment
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Total Students */}
        <Card padding="p-4" className="flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Students</span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-slate-100">{overview?.totalStudents || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Enrolled cohort</p>
          </div>
        </Card>

        {/* 2. Total Groups */}
        <Card padding="p-4" className="flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Student Groups</span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-indigo-400">{overview?.totalGroups || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Active teams</p>
          </div>
        </Card>

        {/* 3. Total Assignments */}
        <Card padding="p-4" className="flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Assignments</span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-teal-400">{overview?.totalAssignments || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Coursework posted</p>
          </div>
        </Card>

        {/* 4. Confirmed Submissions */}
        <Card padding="p-4" className="flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Confirmed</span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-emerald-400">{overview?.totalConfirmedSubmissions || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Verified on OneDrive</p>
          </div>
        </Card>

        {/* 5. Pending Submissions */}
        <Card padding="p-4" className="flex flex-col justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Pending</span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-amber-400">{overview?.pendingSubmissions || 0}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">Awaiting submissions</p>
          </div>
        </Card>

        {/* 6. Overall Completion Rate */}
        <Card padding="p-4" className="flex flex-col justify-between bg-gradient-to-br from-slate-900 to-indigo-950/30 border-indigo-500/20">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-300">Completion</span>
          <div className="mt-2">
            <p className="text-2xl font-bold text-indigo-400">{overview?.overallCompletionRate || 0}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Cohort completion</p>
          </div>
        </Card>
      </div>

      {/* Cohort Progress Overview */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Overall Coursework Confirmation Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {overview?.totalConfirmedSubmissions || 0} of {overview?.totalExpectedSubmissions || 0} expected student submissions confirmed
            </p>
          </div>
          <Link to="/admin/analytics">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              Deep Analytics
            </Button>
          </Link>
        </div>
        <ProgressBar
          value={overview?.totalConfirmedSubmissions || 0}
          max={overview?.totalExpectedSubmissions || 1}
          color="indigo"
          size="lg"
        />
      </Card>

      {/* Two Column Grid: Assignments Management & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Coursework Table Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Active Coursework Items</span>
            </h3>
            <Link to="/admin/assignments" className="text-xs font-medium text-teal-400 hover:underline">
              Manage all ({assignments.length})
            </Link>
          </div>

          {assignments.length > 0 ? (
            <div className="space-y-3">
              {assignments.slice(0, 4).map((assignment) => {
                const dueDate = new Date(assignment.due_date);
                const isOverdue = dueDate < new Date();

                return (
                  <Card key={assignment.id} padding="p-4" hover className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={assignment.target_type === 'ALL' ? 'default' : 'purple'} size="sm">
                          {assignment.target_type === 'ALL'
                            ? 'All Students'
                            : `${assignment.target_groups?.length || 1} Group(s)`}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Due: {dueDate.toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 truncate">{assignment.title}</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        <strong className="text-emerald-400 font-semibold">
                          {assignment.total_confirmed_submissions || 0}
                        </strong>{' '}
                        submissions confirmed
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link to={`/admin/assignments/${assignment.id}`}>
                        <Button variant="secondary" size="sm">
                          Audit Submissions
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No Assignments Created"
              description="Start by creating and assigning coursework to all students or specific groups."
              actionLabel="Create First Assignment"
              onAction={() => window.location.assign('/admin/assignments/new')}
            />
          )}
        </div>

        {/* Right 1 Col: Quick Actions & Deadlines */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Upcoming Deadlines</span>
          </h3>

          <Card className="space-y-4">
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((item) => (
                  <div key={item.id} className="text-xs py-2 border-b border-slate-800/60 last:border-0">
                    <p className="font-semibold text-slate-200 truncate">{item.title}</p>
                    <p className="text-slate-400 mt-0.5">
                      Deadline:{' '}
                      <strong className="text-amber-400 font-medium">
                        {new Date(item.due_date).toLocaleDateString()}
                      </strong>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No deadlines pending</p>
            )}

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <Link to="/admin/assignments/new" className="block">
                <Button variant="primary" size="sm" className="w-full" icon={PlusCircle}>
                  Post New Assignment
                </Button>
              </Link>
              <Link to="/admin/groups" className="block">
                <Button variant="outline" size="sm" className="w-full" icon={Users}>
                  Group Progress Monitor
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
