import React, { useState, useEffect } from 'react';
import {
  Users2,
  UserPlus,
  Trash2,
  Crown,
  Calendar,
  Mail,
  Hash,
  AlertCircle,
  CheckCircle2,
  LogOut,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { groupService } from '../../services/group.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function StudentGroupPage() {
  const { user, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);

  // Create Group Form
  const [createGroupName, setCreateGroupName] = useState('');
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [createError, setCreateError] = useState('');

  // Add Member Form
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [addingMember, setAddingMember] = useState(false);
  const [addError, setAddError] = useState('');

  // Remove Member Modal
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removingMember, setRemovingMember] = useState(false);

  const fetchGroup = async () => {
    setLoading(true);
    try {
      const data = await groupService.getMyGroup();
      setGroup(data);
    } catch (err) {
      console.error('Failed to load group:', err);
      toastError(err.message || 'Unable to fetch group details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroup();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreateError('');

    if (!createGroupName.trim() || createGroupName.trim().length < 3) {
      setCreateError('Group name must be at least 3 characters.');
      return;
    }

    setCreatingGroup(true);
    try {
      const newGroup = await groupService.createGroup(createGroupName.trim());
      success(`Group "${newGroup.name}" created successfully!`);
      setGroup(newGroup);
      setCreateGroupName('');
      await refreshProfile();
    } catch (err) {
      const msg = err.message || 'Failed to create group.';
      setCreateError(msg);
      toastError(msg);
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddError('');

    if (!memberIdentifier.trim()) {
      setAddError('Please enter a Student Email or Student ID.');
      return;
    }

    setAddingMember(true);
    try {
      const updatedMembers = await groupService.addMember(group.id, memberIdentifier.trim());
      success(`Student successfully added to ${group.name}!`);
      setGroup({ ...group, members: updatedMembers });
      setMemberIdentifier('');
    } catch (err) {
      const msg = err.message || 'Failed to add student.';
      setAddError(msg);
      toastError(msg);
    } finally {
      setAddingMember(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    setRemovingMember(true);
    try {
      const updatedMembers = await groupService.removeMember(group.id, memberToRemove.id);
      success(`${memberToRemove.name} has been removed from the group.`);

      // If user removed themselves, clear group state
      if (memberToRemove.id === user.id) {
        setGroup(null);
        await refreshProfile();
      } else {
        setGroup({ ...group, members: updatedMembers });
      }
      setMemberToRemove(null);
    } catch (err) {
      const msg = err.message || 'Failed to remove member.';
      toastError(msg);
    } finally {
      setRemovingMember(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" message="Loading group workspace..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 tracking-tight">My Group Workspace</h2>
        <p className="text-sm text-slate-400 mt-1">
          Collaborate on targeted team assignments and monitor collective progress.
        </p>
      </div>

      {/* Case 1: Student is NOT in any group */}
      {!group ? (
        <div className="max-w-xl mx-auto">
          <Card className="p-8">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 mx-auto mb-4 shadow-lg shadow-teal-500/5">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-100">Create Your Student Group</h3>
              <p className="text-xs text-slate-400 mt-1">
                You are not in a group yet. Create your group to invite peers and tackle team assignments.
              </p>
            </div>

            {createError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <Input
                label="Group / Team Name"
                type="text"
                placeholder="e.g. Distributed Systems Alpha"
                icon={Users2}
                value={createGroupName}
                onChange={(e) => {
                  setCreateGroupName(e.target.value);
                  if (createError) setCreateError('');
                }}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={creatingGroup}
                icon={PlusCircle}
                className="w-full mt-2"
              >
                Create Group & Become Leader
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        /* Case 2: Student has an active group */
        <div className="space-y-6">
          {/* Group Overview Banner Card */}
          <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-900/60 border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="purple" size="sm">
                    Active Group
                  </Badge>
                  {group.is_creator ? (
                    <Badge variant="creator" size="sm">
                      <Crown className="w-3 h-3 text-indigo-400" /> Group Leader
                    </Badge>
                  ) : (
                    <Badge variant="default" size="sm">
                      Member
                    </Badge>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-100 tracking-tight">{group.name}</h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Formed on{' '}
                  {new Date(group.created_at).toLocaleDateString(undefined, {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {!group.is_creator && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setMemberToRemove({ id: user.id, name: 'yourself', isSelf: true })
                  }
                  className="text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                  icon={LogOut}
                >
                  Leave Group
                </Button>
              )}
            </div>
          </Card>

          {/* Add / Invite Member Section (Only visible to group members) */}
          <Card className="p-6">
            <h4 className="text-base font-semibold text-slate-100 mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-teal-400" />
              <span>Invite / Add Student Peer</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              Enter an enrolled student's official email or Student ID to add them to this group.
            </p>

            {addError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddMember} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Student Email (e.g. brianna@student.edu) or ID (e.g. STU1002)"
                  icon={Mail}
                  value={memberIdentifier}
                  onChange={(e) => {
                    setMemberIdentifier(e.target.value);
                    if (addError) setAddError('');
                  }}
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={addingMember}
                icon={UserPlus}
                className="shrink-0 sm:self-start"
              >
                Add Member
              </Button>
            </form>
          </Card>

          {/* Group Members Roster Table */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-semibold text-slate-100 flex items-center gap-2">
                <Users2 className="w-4 h-4 text-purple-400" />
                <span>Group Members ({group.members?.length || 0})</span>
              </h4>
              <span className="text-xs text-slate-400">Strictly 1 group per student</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    <th className="pb-3 px-3">Student Name</th>
                    <th className="pb-3 px-3">Student ID</th>
                    <th className="pb-3 px-3">Email Address</th>
                    <th className="pb-3 px-3">Role</th>
                    <th className="pb-3 px-3">Joined Date</th>
                    <th className="pb-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {group.members?.map((member) => {
                    const isSelf = member.id === user.id;
                    const canRemove = group.is_creator ? !member.is_creator : isSelf;

                    return (
                      <tr key={member.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-3 font-semibold text-slate-100 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px] text-teal-400 shrink-0">
                            {member.name.charAt(0)}
                          </div>
                          <span>{member.name} {isSelf && <span className="text-slate-500">(You)</span>}</span>
                        </td>
                        <td className="py-3.5 px-3 font-mono text-slate-300">
                          {member.student_id || '—'}
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">{member.email}</td>
                        <td className="py-3.5 px-3">
                          {member.is_creator ? (
                            <Badge variant="creator" size="sm">
                              Leader
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              Member
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-400">
                          {new Date(member.joined_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          {canRemove && (
                            <button
                              onClick={() => setMemberToRemove(member)}
                              className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                              title={isSelf ? 'Leave Group' : 'Remove Member'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Confirmation Modal for Member Removal */}
      <Modal
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        title={memberToRemove?.isSelf ? 'Leave Group' : 'Remove Group Member'}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            {memberToRemove?.isSelf
              ? 'Are you sure you want to leave this group? You will lose access to assignments targeted specifically to this group.'
              : `Are you sure you want to remove ${memberToRemove?.name} from ${group?.name}?`}
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              size="md"
              onClick={() => setMemberToRemove(null)}
              disabled={removingMember}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="md"
              loading={removingMember}
              onClick={handleConfirmRemove}
            >
              {memberToRemove?.isSelf ? 'Confirm Leave' : 'Confirm Remove'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
