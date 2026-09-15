import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users2,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  PlusCircle,
  ArrowRight,
  AlertTriangle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { assignmentService } from '../../services/assignment.service';
import { groupService } from '../../services/group.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [groupData, assignmentsData] = await Promise.all([
        groupService.getMyGroup(),
        assignmentService.getStudentAssignments(),
      ]);
      setGroup(groupData);
      setAssignments(assignmentsData || []);
    } catch (err) {
      console.error('Error loading student dashboard:', err);
      setError('Unable to load dashboard information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading your academic workspace..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Dashboard Unavailable"
        description={error}
        actionLabel="Retry"
        onAction={fetchData}
      />
    );
  }

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.is_submitted).length;
  const pendingAssignments = totalAssignments - completedAssignments;
  const completionPercentage =
    totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  const upcomingAssignments = [...assignments]
    .filter((a) => !a.is_submitted)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
    .slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Track your coursework, manage group milestones, and submit assignments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/student/assignments">
            <Button variant="primary" size="md" icon={BookOpen}>
              View Assignments
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Group Status Card */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current Group</span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Users2 className="w-4 h-4" />
            </div>
          </div>
          {group ? (
            <div>
              <p className="text-lg font-bold text-slate-100 truncate">{group.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-slate-400">{group.members?.length || 1} Member(s)</span>
                {group.is_creator && (
                  <Badge variant="creator" size="sm">
                    Leader
                  </Badge>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p className="text-sm font-semibold text-amber-400">No Group Yet</p>
              <Link to="/student/group" className="text-xs text-teal-400 hover:underline inline-block mt-1">
                Create or join group →
              </Link>
            </div>
          )}
        </Card>

        {/* 2. Total Assignments */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Assigned</span>
            <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{totalAssignments}</p>
            <p className="text-xs text-slate-400 mt-1">Coursework tasks assigned</p>
          </div>
        </Card>

        {/* 3. Completed Submissions */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Completed</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-400">{completedAssignments}</p>
            <p className="text-xs text-slate-400 mt-1">Confirmed on OneDrive</p>
          </div>
        </Card>

        {/* 4. Pending Submissions */}
        <Card padding="p-5" className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">{pendingAssignments}</p>
            <p className="text-xs text-slate-400 mt-1">Awaiting confirmation</p>
          </div>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Overall Coursework Progress</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {completedAssignments} of {totalAssignments} assignments submitted
            </p>
          </div>
          <Link to="/student/progress">
            <Button variant="outline" size="sm" icon={ArrowRight}>
              View Group Progress
            </Button>
          </Link>
        </div>
        <ProgressBar value={completedAssignments} max={totalAssignments || 1} color="teal" size="lg" />
      </Card>

      {/* Two Column Grid: Upcoming Deadlines & Group Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming Deadlines */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-400" />
              <span>Upcoming Deadlines</span>
            </h3>
            <Link to="/student/assignments" className="text-xs font-medium text-teal-400 hover:underline">
              View all
            </Link>
          </div>

          {upcomingAssignments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAssignments.map((assignment) => {
                const dueDate = new Date(assignment.due_date);
                const isOverdue = dueDate < new Date();

                return (
                  <Card key={assignment.id} padding="p-4" hover className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                          {isOverdue ? 'Overdue' : 'Due Soon'}
                        </Badge>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {dueDate.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-100 truncate">{assignment.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{assignment.description}</p>
                    </div>
                    <Link to={`/student/assignments/${assignment.id}`}>
                      <Button variant="secondary" size="sm">
                        Submit
                      </Button>
                    </Link>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={CheckCircle2}
              title="All Caught Up!"
              description="You have no pending assignments with upcoming deadlines."
              className="py-10"
            />
          )}
        </div>

        {/* Right 1 Col: Group Hub Summary Widget */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Users2 className="w-4 h-4 text-purple-400" />
            <span>Group Hub</span>
          </h3>

          {group ? (
            <Card className="space-y-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Team Name</span>
                <h4 className="text-base font-bold text-slate-100 truncate mt-0.5">{group.name}</h4>
              </div>

              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
                  Active Peers ({group.members?.length || 0})
                </span>
                <div className="space-y-2">
                  {group.members?.slice(0, 4).map((member) => (
                    <div key={member.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 last:border-0">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-teal-400">
                          {member.name.charAt(0)}
                        </div>
                        <span className="text-slate-200 truncate">{member.name}</span>
                      </div>
                      {member.is_creator && (
                        <Badge variant="creator" size="sm">
                          Leader
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <Link to="/student/group" className="block pt-2">
                <Button variant="outline" size="sm" className="w-full">
                  Manage Group & Invites
                </Button>
              </Link>
            </Card>
          ) : (
            <Card className="text-center py-6">
              <Users2 className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-100 mb-1">Collaborate in Teams</h4>
              <p className="text-xs text-slate-400 mb-4 px-2 leading-relaxed">
                Join or create a group to work on group-specific assignments together.
              </p>
              <Link to="/student/group">
                <Button variant="primary" size="sm" icon={PlusCircle}>
                  Create a Group
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
