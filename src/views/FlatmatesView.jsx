import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  CalendarOff,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Phone,
  Mail
} from 'lucide-react';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { ChoreIcon } from '../components/ChoreIcon.jsx';
import { Modal } from '../components/Modal.jsx';

const AVATAR_OPTIONS = ['👨‍💻', '🧑‍🔬', '🧑‍🎨', '🧑‍🚀', '👩‍💼', '🧑‍🍳', '👩‍🎓', '🧕', '🧑‍🎤', '🧑‍💻', '🧙‍♂️', '🦸'];

export function FlatmatesView({
  flatmates,
  chores,
  assignments,
  onAddFlatmate,
  onEditFlatmate,
  onDeleteFlatmate,
  onToggleLeave,
  onToggleChoreDone
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFlatmate, setEditingFlatmate] = useState(null);
  const [deleteConfirmFlatmate, setDeleteConfirmFlatmate] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    avatar: '👨‍💻',
    email: '',
    role: 'Flatmate'
  });

  const choreMap = {};
  for (const c of chores) choreMap[c.id] = c;

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      avatar: AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)],
      email: '',
      role: 'Flatmate'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (flatmate) => {
    setEditingFlatmate(flatmate);
    setFormData({
      name: flatmate.name,
      avatar: flatmate.avatar || '👨‍💻',
      email: flatmate.email || '',
      role: flatmate.role || 'Flatmate'
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onAddFlatmate({
      name: formData.name.trim(),
      avatar: formData.avatar,
      email: formData.email.trim() || `${formData.name.toLowerCase().replace(/\s+/g, '')}@flatmates.local`,
      role: formData.role
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !editingFlatmate) return;
    onEditFlatmate(editingFlatmate.id, {
      name: formData.name.trim(),
      avatar: formData.avatar,
      email: formData.email.trim(),
      role: formData.role
    });
    setEditingFlatmate(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Flatmate Roster Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {flatmates.length} flatmates registered · {flatmates.filter(f => !f.onLeave).length} available on duty
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Flatmate</span>
        </button>
      </div>

      {/* Flatmates Grid */}
      {flatmates.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No flatmates found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add at least one flatmate to start assigning chores and balancing household duties.
          </p>
          <button
            onClick={handleOpenAdd}
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Add Flatmate Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {flatmates.map((flatmate) => {
            const flatmateAssignments = assignments.filter(a => a.flatmateId === flatmate.id);
            const totalDiff = flatmateAssignments.reduce((sum, a) => {
              const chore = choreMap[a.choreId];
              return sum + (chore?.difficulty || 0);
            }, 0);

            return (
              <div
                key={flatmate.id}
                className={`rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  flatmate.onLeave
                    ? 'border-purple-200 bg-purple-50/15'
                    : 'border-slate-200/90 hover:border-indigo-300'
                }`}
              >
                {/* Flatmate Info Top */}
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shadow-inner border border-slate-200/60">
                        {flatmate.avatar || '👨‍💻'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-900 text-lg">
                            {flatmate.name}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500">{flatmate.email || 'flatmate@flat.local'}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          {flatmate.onLeave ? (
                            <StatusBadge status="ON_LEAVE" size="sm" />
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <UserCheck className="w-3 h-3" /> Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Edit/Delete Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(flatmate)}
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Flatmate"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmFlatmate(flatmate)}
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Flatmate"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lifetime stats pill */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Lifetime Done</span>
                      <p className="font-extrabold text-slate-800 text-sm">
                        {flatmate.totalCompleted || 0} chores
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Diff Points</span>
                      <p className="font-extrabold text-indigo-600 text-sm">
                        {flatmate.totalDifficultyPoints || 0} pts
                      </p>
                    </div>
                  </div>

                  {/* Current Week Assignments Section */}
                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Current Week Assignment ({flatmateAssignments.length})
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {totalDiff} difficulty pts
                      </span>
                    </div>

                    {flatmate.onLeave ? (
                      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl text-purple-800 text-xs flex items-center gap-2">
                        <CalendarOff className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>Excluded from assignment while on leave.</span>
                      </div>
                    ) : flatmateAssignments.length === 0 ? (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-xs italic">
                        No chores assigned this week.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {flatmateAssignments.map((a) => {
                          const chore = choreMap[a.choreId] || { title: 'Unknown Chore', difficulty: 1, icon: 'CheckSquare' };
                          const isDone = a.status === 'DONE';

                          return (
                            <div
                              key={a.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                                isDone
                                  ? 'bg-emerald-50/60 border-emerald-200'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <ChoreIcon name={chore.icon} className="w-4 h-4 text-indigo-600 shrink-0" />
                                <span className={`font-semibold truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                                  {chore.title}
                                </span>
                                <DifficultyBadge difficulty={chore.difficulty} showStars={false} size="sm" />
                              </div>

                              <button
                                type="button"
                                onClick={() => onToggleChoreDone(a.id)}
                                className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                              >
                                {isDone ? 'Done' : 'Mark Done'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer with Leave Toggle */}
                <div className="px-6 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Leave Status</span>
                  <button
                    type="button"
                    onClick={() => onToggleLeave(flatmate.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      flatmate.onLeave
                        ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                    }`}
                  >
                    {flatmate.onLeave ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        Mark Available
                      </>
                    ) : (
                      <>
                        <CalendarOff className="w-3.5 h-3.5" />
                        Mark On Leave
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Flatmate Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Flatmate"
        subtitle="Register a new flatmate to include in weekly chore rotations"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Flatmate Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Rahul, Sneha, Amit"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setFormData({ ...formData, avatar: emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    formData.avatar === emoji
                      ? 'bg-indigo-100 border-2 border-indigo-600 scale-105'
                      : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email / Contact (Optional)
            </label>
            <input
              type="email"
              placeholder="name@flatmates.local"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
            >
              Add Flatmate
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Flatmate Modal */}
      <Modal
        isOpen={!!editingFlatmate}
        onClose={() => setEditingFlatmate(null)}
        title={`Edit Flatmate: ${editingFlatmate?.name}`}
        subtitle="Update flatmate information"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Flatmate Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select Avatar
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setFormData({ ...formData, avatar: emoji })}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    formData.avatar === emoji
                      ? 'bg-indigo-100 border-2 border-indigo-600 scale-105'
                      : 'bg-slate-100 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email / Contact
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingFlatmate(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmFlatmate}
        onClose={() => setDeleteConfirmFlatmate(null)}
        title="Delete Flatmate"
        subtitle="This action cannot be undone"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirmFlatmate?.name}</span>? Any chores assigned to them will be rebalanced automatically among remaining flatmates.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteConfirmFlatmate(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteFlatmate(deleteConfirmFlatmate.id);
                setDeleteConfirmFlatmate(null);
              }}
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm cursor-pointer"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
