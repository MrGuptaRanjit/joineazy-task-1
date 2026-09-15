import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  PlusCircle,
  Calendar,
  ExternalLink,
  Edit,
  Trash2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminAssignmentsPage() {
  const { success, error: toastError } = useToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [targetFilter, setTargetFilter] = useState('ALL'); // 'ALL' | 'GLOBAL' | 'GROUPS'
  const [deleteModalAssignment, setDeleteModalAssignment] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAssignments();
      setAssignments(data || []);
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      toastError('Unable to load assignments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleDeleteAssignment = async () => {
    if (!deleteModalAssignment) return;

    setDeleting(true);
    try {
      await adminService.deleteAssignment(deleteModalAssignment.id);
      success('Assignment deleted successfully.');
      setAssignments((prev) => prev.filter((a) => a.id !== deleteModalAssignment.id));
      setDeleteModalAssignment(null);
    } catch (err) {
      toastError(err.message || 'Failed to delete assignment.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTarget =
      targetFilter === 'ALL' ||
      (targetFilter === 'GLOBAL' && a.target_type === 'ALL') ||
      (targetFilter === 'GROUPS' && a.target_type === 'GROUPS');

    return matchesSearch && matchesTarget;
  });

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading assignment inventory..." />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Assignment Management</h2>
          <p className="text-sm text-slate-400 mt-1">
            Create coursework tasks, configure group targets, and audit student confirmations.
          </p>
        </div>
        <Link to="/admin/assignments/new">
          <Button variant="primary" size="md" icon={PlusCircle}>
            New Assignment
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <Card padding="p-4" className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search assignments by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Target Scope Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl self-stretch sm:self-auto justify-center">
          <button
            onClick={() => setTargetFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              targetFilter === 'ALL'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({assignments.length})
          </button>
          <button
            onClick={() => setTargetFilter('GLOBAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              targetFilter === 'GLOBAL'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Students ({assignments.filter((a) => a.target_type === 'ALL').length})
          </button>
          <button
            onClick={() => setTargetFilter('GROUPS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              targetFilter === 'GROUPS'
                ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Targeted Groups ({assignments.filter((a) => a.target_type === 'GROUPS').length})
          </button>
        </div>
      </Card>

      {/* Assignments Table */}
      {filteredAssignments.length > 0 ? (
        <Card padding="p-0" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Target Scope</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Submissions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {filteredAssignments.map((assignment) => {
                  const dueDate = new Date(assignment.due_date);
                  const isOverdue = dueDate < new Date();

                  return (
                    <tr key={assignment.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Title */}
                      <td className="py-4 px-4">
                        <h4 className="font-semibold text-slate-100 text-sm">{assignment.title}</h4>
                        <p className="text-slate-400 text-xs line-clamp-1 max-w-md mt-0.5">
                          {assignment.description}
                        </p>
                      </td>

                      {/* Target */}
                      <td className="py-4 px-4">
                        {assignment.target_type === 'ALL' ? (
                          <Badge variant="default" size="sm">
                            All Students
                          </Badge>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <Badge variant="purple" size="sm">
                              {assignment.target_groups?.length || 0} Group(s)
                            </Badge>
                            <span className="text-[10px] text-slate-500 line-clamp-1 max-w-[140px]">
                              {assignment.target_groups?.map((g) => g.name).join(', ')}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Due Date */}
                      <td className="py-4 px-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{dueDate.toLocaleDateString()}</span>
                        </div>
                        {isOverdue && <span className="text-[10px] text-rose-400 block mt-0.5">Past Deadline</span>}
                      </td>

                      {/* Submissions Count */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-semibold text-slate-100">
                            {assignment.total_confirmed_submissions || 0}
                          </span>
                          <span className="text-slate-400">confirmed</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/admin/assignments/${assignment.id}`}>
                            <Button variant="secondary" size="sm" icon={Eye} title="Audit Submissions">
                              Audit
                            </Button>
                          </Link>

                          <Link to={`/admin/assignments/${assignment.id}/edit`}>
                            <button
                              className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                              title="Edit Assignment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </Link>

                          <button
                            onClick={() => setDeleteModalAssignment(assignment)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No Matching Assignments"
          description="Try adjusting your search query or filter settings."
          actionLabel="Create Assignment"
          onAction={() => window.location.assign('/admin/assignments/new')}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteModalAssignment)}
        onClose={() => setDeleteModalAssignment(null)}
        title="Delete Assignment"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            Are you sure you want to delete{' '}
            <strong className="text-slate-100 font-semibold">{deleteModalAssignment?.title}</strong>?
            This will permanently remove the assignment and associated target allocations and submission records.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              disabled={deleting}
              onClick={() => setDeleteModalAssignment(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={deleting}
              onClick={handleDeleteAssignment}
              icon={Trash2}
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
