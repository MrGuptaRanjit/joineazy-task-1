import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  FolderLock,
} from 'lucide-react';
import { assignmentService } from '../../services/assignment.service';
import { submissionService } from '../../services/submission.service';
import { useToast } from '../../hooks/useToast';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentAssignmentDetailsPage() {
  const { id } = useParams();
  const { success, error: toastError } = useToast();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Two-Step Submission Flow State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStep1Checked, setIsStep1Checked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssignment = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await assignmentService.getStudentAssignmentDetails(id);
      setAssignment(data);
    } catch (err) {
      console.error('Error fetching assignment details:', err);
      setError(err.message || 'Unable to load assignment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  // Step 1: Open Confirmation Modal
  const handleOpenConfirmation = () => {
    setIsStep1Checked(false);
    setIsModalOpen(true);
  };

  // Step 2: Final Confirmed Submission Action
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const response = await submissionService.confirmSubmission(id, {
        is_confirmed: true,
      });

      success('Assignment submission successfully confirmed!');
      setIsModalOpen(false);

      // Immediately reflect submitted state
      setAssignment((prev) => ({
        ...prev,
        is_submitted: true,
        submission_status: 'CONFIRMED',
        confirmed_at: response.submission?.confirmed_at || new Date().toISOString(),
      }));
    } catch (err) {
      const msg = err.message || 'Submission confirmation failed. Please try again.';
      toastError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading assignment..." />;
  }

  if (error || !assignment) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Assignment Not Found"
        description={error || 'This assignment does not exist or is not targeted to your group.'}
        actionLabel="Back to Assignments"
        onAction={() => window.history.back()}
      />
    );
  }

  const dueDate = new Date(assignment.due_date);
  const isOverdue = dueDate < new Date() && !assignment.is_submitted;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Navigation Breadcrumb */}
      <div>
        <Link
          to="/student/assignments"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-teal-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assignments</span>
        </Link>
      </div>

      {/* Main Assignment Card */}
      <Card className="p-6 sm:p-8 space-y-6">
        {/* Status and Scope Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {assignment.is_submitted ? (
              <Badge variant="success" size="md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Confirmed Submitted
              </Badge>
            ) : (
              <Badge variant={isOverdue ? 'danger' : 'warning'} size="md">
                <Clock className="w-3.5 h-3.5" /> {isOverdue ? 'Overdue' : 'Pending Submission'}
              </Badge>
            )}

            <Badge variant={assignment.target_type === 'ALL' ? 'default' : 'purple'} size="md">
              {assignment.target_type === 'ALL' ? 'All Students' : 'Group Specific'}
            </Badge>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            Due Date:{' '}
            <strong className="text-slate-200 font-semibold">
              {dueDate.toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </strong>
          </div>
        </div>

        {/* Title and Description */}
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-tight">
            {assignment.title}
          </h1>

          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-line font-normal">
            {assignment.description}
          </div>
        </div>

        {/* Submission Action Zone */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950/80 to-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FolderLock className="w-4 h-4 text-teal-400" />
              <span>Step 1: Upload to OneDrive</span>
            </h4>
            <p className="text-xs text-slate-400">
              Access the professor's shared OneDrive repository to place your files.
            </p>
          </div>

          <a
            href={assignment.onedrive_link}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="outline"
              size="md"
              icon={ExternalLink}
              className="text-teal-400 border-teal-500/30 hover:border-teal-500/60 hover:bg-teal-500/10"
            >
              Open OneDrive Link
            </Button>
          </a>
        </div>

        {/* Step 2 Confirmation Card */}
        <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Step 2: Verify Submission</span>
            </h4>
            <p className="text-xs text-slate-400">
              Once files are deposited in OneDrive, confirm your submission to notify the professor.
            </p>
          </div>

          {assignment.is_submitted ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Submission confirmed on{' '}
                {new Date(assignment.confirmed_at).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onClick={handleOpenConfirmation}
              icon={ShieldCheck}
              className="shrink-0"
            >
              Yes, I have submitted
            </Button>
          )}
        </div>
      </Card>

      {/* Two-Step Verification Dialog Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !submitting && setIsModalOpen(false)}
        title="Confirm OneDrive Submission"
      >
        <div className="space-y-5">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <p className="font-semibold text-slate-100 mb-1">
              Assignment: {assignment.title}
            </p>
            <p className="text-slate-400">
              Please ensure your coursework files are fully uploaded and synchronized in the designated OneDrive link before confirming.
            </p>
          </div>

          <label className="flex items-start gap-3 p-3.5 rounded-xl bg-teal-500/5 border border-teal-500/20 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isStep1Checked}
              onChange={(e) => setIsStep1Checked(e.target.checked)}
              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 bg-slate-950 border-slate-700"
            />
            <span className="text-xs text-slate-200 font-medium leading-snug">
              I certify that I have deposited my complete submission files in the professor's OneDrive folder.
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              disabled={submitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              size="md"
              loading={submitting}
              disabled={!isStep1Checked}
              onClick={handleFinalSubmit}
              icon={ShieldCheck}
            >
              Confirm Submission
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
