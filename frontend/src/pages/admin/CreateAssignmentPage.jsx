import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Link2,
  Users,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CreateAssignmentPage() {
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    onedrive_link: '',
    target_type: 'ALL',
    group_ids: [],
  });

  const [availableGroups, setAvailableGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoadingGroups(true);
      try {
        const groups = await adminService.getAllGroups();
        setAvailableGroups(groups || []);
      } catch (err) {
        console.error('Failed to load groups:', err);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required.';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required.';
    }

    if (!formData.due_date) {
      errs.due_date = 'Due date is required.';
    }

    if (!formData.onedrive_link.trim()) {
      errs.onedrive_link = 'OneDrive submission link is required.';
    } else if (!/^https?:\/\/.+/i.test(formData.onedrive_link)) {
      errs.onedrive_link = 'Please enter a valid URL starting with http:// or https://';
    }

    if (formData.target_type === 'GROUPS' && formData.group_ids.length === 0) {
      errs.group_ids = 'Please select at least one student group.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGroupToggle = (groupId) => {
    setFormData((prev) => {
      const exists = prev.group_ids.includes(groupId);
      return {
        ...prev,
        group_ids: exists
          ? prev.group_ids.filter((id) => id !== groupId)
          : [...prev.group_ids, groupId],
      };
    });
    if (errors.group_ids) setErrors({ ...errors, group_ids: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setSubmitting(true);
    try {
      await adminService.createAssignment({
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: new Date(formData.due_date).toISOString(),
        onedrive_link: formData.onedrive_link.trim(),
        target_type: formData.target_type,
        group_ids: formData.target_type === 'GROUPS' ? formData.group_ids : [],
      });

      success('Assignment created and allocated successfully!');
      navigate('/admin/assignments');
    } catch (err) {
      const msg = err.message || 'Failed to create assignment.';
      setServerError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
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

      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Create New Assignment</h2>
          <p className="text-xs text-slate-400 mt-1">
            Specify coursework requirements, due date, submission repository, and target audience.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <Input
            label="Assignment Title"
            type="text"
            placeholder="e.g. Distributed Consensus & Raft Protocol"
            icon={BookOpen}
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            error={errors.title}
            required
          />

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description / Instructions <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Detail the submission instructions, deliverables, rubric, and format specifications..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              className={`w-full p-3.5 bg-slate-950/80 border text-slate-100 placeholder-slate-500 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                errors.description ? 'border-rose-500/80' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-400 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Due Date & OneDrive Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Submission Due Date"
              type="datetime-local"
              icon={Calendar}
              value={formData.due_date}
              onChange={(e) => {
                setFormData({ ...formData, due_date: e.target.value });
                if (errors.due_date) setErrors({ ...errors, due_date: '' });
              }}
              error={errors.due_date}
              required
            />

            <Input
              label="OneDrive Folder URL"
              type="url"
              placeholder="https://onedrive.live.com/..."
              icon={Link2}
              value={formData.onedrive_link}
              onChange={(e) => {
                setFormData({ ...formData, onedrive_link: e.target.value });
                if (errors.onedrive_link) setErrors({ ...errors, onedrive_link: '' });
              }}
              error={errors.onedrive_link}
              required
            />
          </div>

          {/* Target Audience Scope Selector */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Assignment Allocation Scope
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, target_type: 'ALL', group_ids: [] })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.target_type === 'ALL'
                    ? 'bg-indigo-500/10 border-indigo-500 text-indigo-300 ring-1 ring-indigo-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <p className="text-sm font-semibold text-slate-100">All Students</p>
                <p className="text-xs text-slate-400 mt-1">
                  Assigned globally to every enrolled student in the cohort.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, target_type: 'GROUPS' })}
                className={`p-4 rounded-xl border text-left transition-all ${
                  formData.target_type === 'GROUPS'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-300 ring-1 ring-purple-500'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <p className="text-sm font-semibold text-slate-100">Specific Groups</p>
                <p className="text-xs text-slate-400 mt-1">
                  Targeted strictly to selected student teams.
                </p>
              </button>
            </div>
          </div>

          {/* Group Multi-Select (if GROUPS chosen) */}
          {formData.target_type === 'GROUPS' && (
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800 animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Target Groups
                </span>
                <span className="text-xs text-purple-400">
                  {formData.group_ids.length} selected
                </span>
              </div>

              {errors.group_ids && (
                <p className="text-xs text-rose-400 font-medium mb-2">{errors.group_ids}</p>
              )}

              {loadingGroups ? (
                <LoadingSpinner size="sm" message="Loading group registry..." />
              ) : availableGroups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
                  {availableGroups.map((g) => {
                    const isSelected = formData.group_ids.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => handleGroupToggle(g.id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                          isSelected
                            ? 'bg-purple-500/15 border-purple-500/50 text-purple-200'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-200 truncate">{g.name}</p>
                          <span className="text-[10px] text-slate-500">
                            {g.member_count || 0} Member(s)
                          </span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-amber-400 py-3 text-center">
                  No active student groups found. Please ask students to form groups first or allocate to "All Students".
                </p>
              )}
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <Link to="/admin/assignments">
              <Button variant="outline" size="md" disabled={submitting}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              icon={PlusCircle}
            >
              Publish Assignment
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
