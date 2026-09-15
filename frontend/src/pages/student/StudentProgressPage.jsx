import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Users2,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Calendar,
  AlertTriangle,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { assignmentService } from '../../services/assignment.service';
import { groupService } from '../../services/group.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentProgressPage() {
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);

  const fetchProgressData = async () => {
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
      console.error('Failed to load progress data:', err);
      setError('Unable to load progress information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  if (loading) {
    return <LoadingSpinner size="lg" message="Calculating team milestone analytics..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Unable to Load Progress"
        description={error}
        actionLabel="Retry"
        onAction={fetchProgressData}
      />
    );
  }

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter((a) => a.is_submitted).length;
  const completionPercentage =
    totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Group & Personal Progress</h2>
        <p className="text-sm text-slate-400 mt-1">
          Monitor your coursework completion velocity and peer milestones.
        </p>
      </div>

      {/* Hero Completion Card */}
      <Card className="p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/20 border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="info" size="sm">
                Milestone Tracker
              </Badge>
              {group && (
                <Badge variant="purple" size="sm">
                  {group.name}
                </Badge>
              )}
            </div>

            <h3 className="text-2xl font-bold text-slate-100">
              {completionPercentage === 100
                ? '🎉 100% Coursework Completed!'
                : `${completionPercentage}% Completed so far`}
            </h3>

            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              You have successfully submitted and confirmed {completedAssignments} of {totalAssignments}{' '}
              assigned coursework tasks on OneDrive.
            </p>

            <ProgressBar value={completedAssignments} max={totalAssignments || 1} size="lg" color="teal" />
          </div>

          {/* Milestone Badges Box */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col gap-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Achievement Badges
            </span>

            <div className="space-y-2 text-xs">
              <div
                className={`flex items-center gap-2.5 p-2 rounded-xl border ${
                  completedAssignments > 0
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span className="font-semibold">First Submission Verified</span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-2 rounded-xl border ${
                  completionPercentage >= 50
                    ? 'bg-teal-500/10 border-teal-500/20 text-teal-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <TrendingUp className="w-4 h-4 shrink-0" />
                <span className="font-semibold">Halfway Milestone (50%+)</span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-2 rounded-xl border ${
                  completionPercentage === 100
                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-300'
                    : 'bg-slate-900 border-slate-800 text-slate-500'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="font-semibold">All Tasks Completed (100%)</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Assignment Breakdown Matrix */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            <span>Coursework Status Breakdown</span>
          </h3>
          <span className="text-xs text-slate-400">{assignments.length} Total Assignments</span>
        </div>

        {assignments.length > 0 ? (
          <div className="divide-y divide-slate-800/60">
            {assignments.map((assignment) => {
              const dueDate = new Date(assignment.due_date);
              const isOverdue = dueDate < new Date() && !assignment.is_submitted;

              return (
                <div
                  key={assignment.id}
                  className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-200 truncate">
                        {assignment.title}
                      </h4>
                      <Badge
                        variant={assignment.target_type === 'ALL' ? 'default' : 'purple'}
                        size="sm"
                      >
                        {assignment.target_type === 'ALL' ? 'Global' : 'Group'}
                      </Badge>
                    </div>

                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      Due:{' '}
                      {dueDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {assignment.is_submitted ? (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
                      </Badge>
                    ) : (
                      <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                        <Clock className="w-3.5 h-3.5" /> {isOverdue ? 'Overdue' : 'Pending'}
                      </Badge>
                    )}

                    <Link to={`/student/assignments/${assignment.id}`}>
                      <Button variant="outline" size="sm" icon={ArrowRight}>
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No Assigned Coursework"
            description="There are currently no coursework items assigned to track."
          />
        )}
      </Card>
    </div>
  );
}
