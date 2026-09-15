import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Eye,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Search,
  AlertTriangle,
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getGroupAnalytics();
      setGroups(data || []);
    } catch (err) {
      console.error('Failed to load group metrics:', err);
      setError('Unable to load group performance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const filteredGroups = groups.filter((g) =>
    g.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinner size="lg" message="Compiling group performance matrix..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Group Data Unavailable"
        description={error}
        actionLabel="Retry"
        onAction={fetchGroups}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Group & Submission Monitoring</h2>
          <p className="text-sm text-slate-400 mt-1">
            Track student team assignments, member rosters, and collective completion velocities.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <Card padding="p-4" className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredGroups.length} Active Group(s)
        </span>
      </Card>

      {/* Group Cards Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => {
            const isFullCompletion = group.group_completion_rate === 100;

            return (
              <Card key={group.group_id} padding="p-6" hover className="flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-slate-100 truncate flex-1">
                      {group.group_name}
                    </h3>
                    <Badge variant={isFullCompletion ? 'success' : 'purple'} size="sm">
                      {group.group_completion_rate}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-slate-800/80">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Members</span>
                      <p className="font-semibold text-slate-200 mt-0.5">{group.total_members} Students</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-500 block">Submissions</span>
                      <p className="font-semibold text-emerald-400 mt-0.5">
                        {group.total_confirmed_submissions} Confirmed
                      </p>
                    </div>
                  </div>

                  <ProgressBar
                    value={group.total_confirmed_submissions}
                    max={(group.total_members * group.eligible_assignments_count) || 1}
                    color={isFullCompletion ? 'emerald' : 'indigo'}
                    size="md"
                  />
                </div>

                <Link to={`/admin/groups/${group.group_id}`} className="block pt-2">
                  <Button variant="outline" size="sm" className="w-full" icon={Eye}>
                    Drilldown & Member Audit
                  </Button>
                </Link>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No Groups Found"
          description="No student groups match your search criteria."
          className="py-16"
        />
      )}
    </div>
  );
}
