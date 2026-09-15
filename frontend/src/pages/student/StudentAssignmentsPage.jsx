import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Filter,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { assignmentService } from '../../services/assignment.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'SUBMITTED'
  const [error, setError] = useState(null);

  const fetchAssignments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getStudentAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError('Unable to load assignments. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'PENDING') return !a.is_submitted;
    if (filter === 'SUBMITTED') return a.is_submitted;
    return true;
  });

  if (loading) {
    return <LoadingSpinner size="lg" message="Fetching assigned coursework..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Error Loading Assignments"
        description={error}
        actionLabel="Retry"
        onAction={fetchAssignments}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Assigned Coursework</h2>
          <p className="text-sm text-slate-400 mt-1">
            Access submission folders on OneDrive and verify your submissions.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl self-start">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'ALL'
                ? 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'PENDING'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({assignments.filter((a) => !a.is_submitted).length})
          </button>
          <button
            onClick={() => setFilter('SUBMITTED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filter === 'SUBMITTED'
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Submitted ({assignments.filter((a) => a.is_submitted).length})
          </button>
        </div>
      </div>

      {/* Assignments List */}
      {filteredAssignments.length > 0 ? (
        <div className="space-y-4">
          {filteredAssignments.map((assignment) => {
            const dueDate = new Date(assignment.due_date);
            const isOverdue = dueDate < new Date() && !assignment.is_submitted;

            return (
              <Card key={assignment.id} hover padding="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Metadata & Details */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {assignment.is_submitted ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Submitted
                        </Badge>
                      ) : (
                        <Badge variant={isOverdue ? 'danger' : 'warning'} size="sm">
                          <Clock className="w-3 h-3" /> {isOverdue ? 'Overdue' : 'Pending'}
                        </Badge>
                      )}

                      <Badge variant={assignment.target_type === 'ALL' ? 'default' : 'purple'} size="sm">
                        {assignment.target_type === 'ALL' ? 'All Students' : 'Group Specific'}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-100 leading-snug">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {assignment.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        Due:{' '}
                        <strong className="text-slate-300 font-medium">
                          {dueDate.toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </strong>
                      </span>

                      {assignment.confirmed_at && (
                        <span className="text-emerald-400/90 text-xs">
                          Confirmed on: {new Date(assignment.confirmed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    {assignment.onedrive_link && (
                      <a
                        href={assignment.onedrive_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto"
                      >
                        <Button
                          variant="outline"
                          size="md"
                          icon={ExternalLink}
                          className="w-full sm:w-auto text-teal-400 border-teal-500/20 hover:border-teal-500/40 hover:bg-teal-500/10"
                        >
                          OneDrive Folder
                        </Button>
                      </a>
                    )}

                    <Link to={`/student/assignments/${assignment.id}`} className="w-full sm:w-auto">
                      <Button
                        variant={assignment.is_submitted ? 'secondary' : 'primary'}
                        size="md"
                        className="w-full sm:w-auto"
                      >
                        {assignment.is_submitted ? 'View Confirmation' : 'Submit Work'}
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title={
            filter === 'ALL'
              ? 'No Coursework Assigned'
              : filter === 'PENDING'
              ? 'No Pending Coursework'
              : 'No Submitted Coursework'
          }
          description={
            filter === 'ALL'
              ? 'There are currently no assignments targeted to you or your student group.'
              : 'Switch filters above to review all coursework assignments.'
          }
          className="py-16"
        />
      )}
    </div>
  );
}
