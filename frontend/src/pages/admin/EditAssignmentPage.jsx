import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  ArrowLeft,
  Calendar,
  Link2,
  Users,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function EditAssignmentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [availableGroups, setAvailableGroups] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    onedrive_link: '',
    target_type: 'ALL',
    group_ids: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [assignmentData, groupsData] = await Promise.all([
          adminService.getAssignmentById(id),
          adminService.getAllGroups(),
        ]);

        if (assignmentData) {
          // Format ISO date to yyyy-MM-ddThh:mm for datetime-local
          let formattedDate = '';
          if (assignmentData.due_date) {
            const d = new Date(assignmentData.due_date);
            formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
          }

          setFormData({
            title: assignmentData.title || '',
            description: assignmentData.description || '',
            due_date: formattedDate,
            onedrive_link: assignmentData.onedrive_link || '',
            target_type: assignmentData.target_type || 'ALL',
            group_ids: assignmentData.target_groups?.map((g) => g.id) || [],
          });
        }

        setAvailableGroups(groupsData || []);
      } catch (err) {
        console.error('Failed to load assignment for editing:', err);
        setServerError('Unable to load assignment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required.';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required.';
    }

    if (!formData.due_date) {
      errs.due_date = 'Due date is required.';
    }

    if (!formData.onedrive_link.trim()) {
      errs.onedrive_link = 'OneDrive link is required.';
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
          ? prev.group_ids.filter((gId) => gId !== groupId)
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
      await adminService.updateAssignment(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        due_date: new Date(formData.due_date).toISOString(),
        onedrive_link: formData.onedrive_link.trim(),
        target_type: formData.target_type,
        group_ids: formData.target_type === 'GROUPS' ? formData.group_ids : [],
      });

      success('Assignment updated successfully.');
      navigate('/admin/assignments');
    } catch (err) {
      const msg = err.message || 'Failed to update assignment.';
      setServerError(msg);
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading assignment specifications..." />;
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-300">
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
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Edit Assignment</h2>
          <p className="text-xs text-slate-400 mt-1">
            Update deadlines, rubric parameters, or adjust team targeting.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Assignment Title"
            type="text"
            icon={BookOpen}
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: '' });
            }}
            error={errors.title}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Description / Instructions <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              className={`w-full p-3.5 bg-slate-950/80 border text-slate-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                errors.description ? 'border-rose-500/80' : 'border-slate-800 focus:border-indigo-500'
              }`}
            />
            {errors.description && (
              <p className="text-xs text-rose-400 font-medium">{errors.description}</p>
            )}
          </div>

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

          {/* Allocation Scope */}
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
                  Global cohort assignment
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
                  Targeted group allocations
                </p>
              </button>
            </div>
          </div>

          {/* Group Multi-Select */}
          {formData.target_type === 'GROUPS' && (
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Targeted Student Groups
                </span>
                <span className="text-xs text-purple-400">
                  {formData.group_ids.length} selected
                </span>
              </div>

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
                      <span className="text-xs font-semibold text-slate-200 truncate">{g.name}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

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
              icon={Save}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
