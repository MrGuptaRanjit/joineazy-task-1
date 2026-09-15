import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Users,
  Search,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AssignmentDetailsAuditPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [auditData, setAuditData] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'CONFIRMED' | 'PENDING'
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getAssignmentSubmissions(id);
      setAuditData(data);
    } catch (err) {
      console.error('Failed to load submission audit:', err);
      setError(err.message || 'Unable to retrieve submission audit matrix.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [id]);

  if (loading) {
    return <LoadingSpinner size="lg" message="Compiling submission audit logs..." />;
  }

  if (error || !auditData) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Audit Matrix Unavailable"
        description={error || 'Assignment records not found.'}
        actionLabel="Back to Assignments"
        onAction={() => window.history.back()}
      />
    );
  }

  const assignment = auditData.assignment;
  const groupSummary = auditData.groupSummary || [];
  const studentSubmissions = auditData.studentSubmissions || [];

  const totalStudents = studentSubmissions.length;
  const confirmedStudents = studentSubmissions.filter((s) => s.status === 'CONFIRMED').length;
  const pendingStudents = totalStudents - confirmedStudents;
  const completionPercentage =
    totalStudents > 0 ? Math.round((confirmedStudents / totalStudents) * 100) : 0;

  const filteredStudents = studentSubmissions.filter((s) => {
    const matchesStatus =
      statusFilter === 'ALL' || s.status === statusFilter;
    const matchesSearch =
      s.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.roll_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.group_name?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* Navigation */}
      <div>
        <Link
          to="/admin/assignments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </Link>
      </div>

      {/* Assignment Header Summary Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={assignment.target_type === 'ALL' ? 'default' : 'purple'} size="sm">
                {assignment.target_type === 'ALL' ? 'All Students' : 'Group Specific'}
              </Badge>
              <Badge variant={completionPercentage === 100 ? 'success' : 'info'} size="sm">
                {completionPercentage}% Confirmed
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight">
              {assignment.title}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Due:{' '}
              <strong className="text-slate-200">
                {new Date(assignment.due_date).toLocaleString()}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {assignment.onedrive_link && (
              <a
                href={assignment.onedrive_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md" icon={ExternalLink}>
                  OneDrive Folder
                </Button>
              </a>
            )}
            <Link to={`/admin/assignments/${assignment.id}/edit`}>
              <Button variant="secondary" size="md">
                Edit Assignment
              </Button>
            </Link>
          </div>
        </div>

        {/* 4-KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Assigned Students
            </span>
            <p className="text-2xl font-bold text-slate-100 mt-1">{totalStudents}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Confirmed
            </span>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{confirmedStudents}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Pending
            </span>
            <p className="text-2xl font-bold text-amber-400 mt-1">{pendingStudents}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Completion Rate
            </span>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{completionPercentage}%</p>
          </div>
        </div>

        <ProgressBar value={confirmedStudents} max={totalStudents || 1} color="indigo" size="md" />
      </Card>

      {/* Group Summary Matrix */}
      {groupSummary.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span>Target Group Performance Summary</span>
            </h3>
            <span className="text-xs text-slate-400">{groupSummary.length} Group(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupSummary.map((group) => (
              <div
                key={group.group_id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-200 text-sm">{group.group_name}</h4>
                  <Badge
                    variant={group.completion_percentage === 100 ? 'success' : 'info'}
                    size="sm"
                  >
                    {group.completion_percentage}%
                  </Badge>
                </div>

                <div className="flex justify-between text-xs text-slate-400">
                  <span>{group.confirmed_submissions} of {group.total_members} members submitted</span>
                </div>

                <ProgressBar
                  value={group.confirmed_submissions}
                  max={group.total_members || 1}
                  color={group.completion_percentage === 100 ? 'emerald' : 'purple'}
                  size="sm"
                  showLabel={false}
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Student Submissions Audit Table */}
      <Card padding="p-0" className="overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-teal-400" />
              <span>Student Confirmation Logs</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified submission logs stored in PostgreSQL
            </p>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({totalStudents})
              </button>
              <button
                onClick={() => setStatusFilter('CONFIRMED')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'CONFIRMED'
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Confirmed ({confirmedStudents})
              </button>
              <button
                onClick={() => setStatusFilter('PENDING')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  statusFilter === 'PENDING'
                    ? 'bg-amber-500/15 text-amber-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pending ({pendingStudents})
              </button>
            </div>
          </div>
        </div>

        {filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Group</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Confirmed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredStudents.map((s) => (
                  <tr key={s.student_id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-100 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-teal-400">
                        {s.student_name?.charAt(0)}
                      </div>
                      <div>
                        <span>{s.student_name}</span>
                        <span className="text-[10px] text-slate-500 block">{s.email}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {s.roll_number || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {s.group_name ? (
                        <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[11px] font-medium">
                          {s.group_name}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No Group</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {s.status === 'CONFIRMED' ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="w-3 h-3" /> Confirmed
                        </Badge>
                      ) : (
                        <Badge variant="warning" size="sm">
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {s.confirmed_at
                        ? new Date(s.confirmed_at).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={FileCheck}
            title="No Matching Submissions"
            description="No student confirmation records match your filter criteria."
            className="py-12"
          />
        )}
      </Card>
    </div>
  );
}
