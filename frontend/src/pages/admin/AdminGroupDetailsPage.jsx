import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Users,
  Layers,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Award,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ErrorAlert from '../../components/ui/ErrorAlert';
import { formatDate } from '../../utils/date';

export default function AdminGroupDetailsPage() {
  const { id: groupId } = useParams();
  const [groupAudit, setGroupAudit] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroupAudit();
  }, [groupId]);

  const fetchGroupAudit = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await adminService.getGroupAudit(groupId);
      setGroupAudit(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load group audit data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner size="lg" text="Loading group submission audit..." />
      </div>
    );
  }

  if (error || !groupAudit) {
    return (
      <div className="space-y-6">
        <Link
          to="/admin/groups"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Groups
        </Link>
        <ErrorAlert
          title="Group Not Found"
          message={error || 'Could not find the requested group information.'}
          onRetry={fetchGroupAudit}
        />
      </div>
    );
  }

  const { group, assignments = [] } = groupAudit;
  const members = group.members || [];
  const overallRate = group.completion_rate ? Math.round(Number(group.completion_rate)) : 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Navigation */}
      <div>
        <Link
          to="/admin/groups"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Groups
        </Link>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{group.name}</h1>
              <Badge variant="primary" size="md">
                Group Audit
              </Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Created by <span className="text-slate-300 font-medium">{group.creator_name}</span> ({group.creator_email}) • Formed {formatDate(group.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Total Members:</span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Users className="w-3.5 h-3.5" />
              {members.length} students
            </span>
          </div>
        </div>
      </div>

      {/* Group Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group Completion</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{overallRate}%</span>
          </div>
          <div className="mt-3">
            <ProgressBar percentage={overallRate} size="sm" />
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Group Size</p>
          <p className="text-2xl font-bold text-white mt-2">{members.length}</p>
          <p className="text-xs text-slate-500 mt-1">Active registered members</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Targeted Assignments</p>
          <p className="text-2xl font-bold text-white mt-2">{assignments.length}</p>
          <p className="text-xs text-slate-500 mt-1">Visible to this group</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Audit Integrity</p>
          <div className="mt-2 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Database Verified</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Member-level confirmations</p>
        </div>
      </div>

      {/* Member Roster */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-brand-400" />
          <h2 className="text-base font-semibold text-white">Group Member Roster ({members.length})</h2>
        </div>

        {members.length === 0 ? (
          <p className="text-sm text-slate-500 italic">No members currently enrolled in this group.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => {
              const isCreator = member.user_id === group.created_by;
              return (
                <div
                  key={member.user_id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCreator
                      ? 'bg-brand-950/20 border-brand-800/40'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{member.name}</span>
                        {isCreator && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{member.email}</p>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        ID: <span className="text-slate-300">{member.student_id || 'N/A'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Member-by-Member Assignment Status Tree */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-semibold text-white">Assignment Completion Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Detailed submission confirmations per student member
              </p>
            </div>
          </div>
        </div>

        {assignments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
            <Layers className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No assignments targeted to this group yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {assignments.map((assignment) => {
              const memberStatuses = assignment.member_statuses || [];
              const submittedCount = memberStatuses.filter((s) => s.is_submitted).length;
              const percent = members.length > 0 ? Math.round((submittedCount / members.length) * 100) : 0;

              return (
                <div
                  key={assignment.id}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700/80 transition-colors"
                >
                  {/* Assignment Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-white">{assignment.title}</h3>
                        <Badge
                          variant={assignment.target_type === 'ALL_STUDENTS' ? 'primary' : 'warning'}
                          size="sm"
                        >
                          {assignment.target_type === 'ALL_STUDENTS' ? 'All Students' : 'Targeted Group'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{assignment.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          Due: {formatDate(assignment.due_date)}
                        </span>
                        {assignment.onedrive_url && (
                          <a
                            href={assignment.onedrive_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-brand-400 hover:text-brand-300 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> OneDrive Folder
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col lg:items-end gap-1.5 min-w-[180px]">
                      <div className="flex items-center justify-between w-full text-xs">
                        <span className="text-slate-400">Group Progress:</span>
                        <span className="font-semibold text-white">
                          {submittedCount}/{members.length} ({percent}%)
                        </span>
                      </div>
                      <ProgressBar percentage={percent} size="sm" className="w-full" />
                    </div>
                  </div>

                  {/* Member Submission Tree */}
                  <div className="mt-4 pt-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Member Submissions ({submittedCount}/{members.length})
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {members.map((member) => {
                        const statusObj = memberStatuses.find((s) => s.user_id === member.user_id);
                        const isSubmitted = statusObj?.is_submitted || false;
                        const confirmedAt = statusObj?.confirmed_at;

                        return (
                          <div
                            key={member.user_id}
                            className={`flex items-center justify-between p-3 rounded-lg border text-xs ${
                              isSubmitted
                                ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-200'
                                : 'bg-slate-900/40 border-slate-800/60 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isSubmitted
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <span className="font-medium text-white">{member.name}</span>
                                <span className="text-slate-500 ml-1.5 font-mono text-[11px]">
                                  ({member.student_id || member.email})
                                </span>
                              </div>
                            </div>

                            <div>
                              {isSubmitted ? (
                                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>{formatDate(confirmedAt)}</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                                  <Clock className="w-4 h-4" />
                                  <span>Pending</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
