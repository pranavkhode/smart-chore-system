import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Info,
  Clock,
  Tag
} from 'lucide-react';
import { DifficultyBadge } from '../components/DifficultyBadge.jsx';
import { ChoreIcon, AVAILABLE_CHORE_ICONS } from '../components/ChoreIcon.jsx';
import { Modal } from '../components/Modal.jsx';
import { DIFFICULTY_LEVELS } from '../constants/defaultData.js';

export function ChoresView({
  chores,
  assignments,
  flatmates,
  onAddChore,
  onEditChore,
  onDeleteChore
}) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [deleteConfirmChore, setDeleteConfirmChore] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    difficulty: 3,
    icon: 'Sparkles',
    category: 'Housekeeping',
    description: '',
    estimatedMinutes: 45
  });

  const handleOpenAdd = () => {
    setFormData({
      title: '',
      difficulty: 3,
      icon: 'Sparkles',
      category: 'Housekeeping',
      description: '',
      estimatedMinutes: 45
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (chore) => {
    setEditingChore(chore);
    setFormData({
      title: chore.title,
      difficulty: chore.difficulty || 3,
      icon: chore.icon || 'Sparkles',
      category: chore.category || 'General',
      description: chore.description || '',
      estimatedMinutes: chore.estimatedMinutes || 30
    });
  };

  const handleSaveAdd = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onAddChore({
      title: formData.title.trim(),
      difficulty: Number(formData.difficulty),
      icon: formData.icon,
      category: formData.category,
      description: formData.description.trim(),
      estimatedMinutes: Number(formData.estimatedMinutes) || 30
    });
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !editingChore) return;
    onEditChore(editingChore.id, {
      title: formData.title.trim(),
      difficulty: Number(formData.difficulty),
      icon: formData.icon,
      category: formData.category,
      description: formData.description.trim(),
      estimatedMinutes: Number(formData.estimatedMinutes) || 30
    });
    setEditingChore(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-indigo-600" />
            Household Chores Catalog
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {chores.length} active chores with balanced difficulty ratings (Levels 1 to 5)
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          type="button"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Chore</span>
        </button>
      </div>

      {/* Difficulty Legend Reference */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          <Info className="w-4 h-4 text-indigo-600" />
          <span>Difficulty Scale Reference (Workload Points)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[1, 2, 3, 4, 5].map((lvl) => {
            const config = DIFFICULTY_LEVELS[lvl];
            return (
              <div key={lvl} className={`p-2.5 rounded-xl border ${config.bg} ${config.border} flex flex-col justify-between`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-black ${config.text}`}>Level {lvl}</span>
                  <span className="font-mono text-[11px] text-slate-600">{config.stars}</span>
                </div>
                <div className="mt-1">
                  <span className={`text-xs font-bold ${config.text}`}>{config.label}</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {lvl === 1 && 'Quick tasks (15–20 min)'}
                    {lvl === 2 && 'Routine tasks (30–40 min)'}
                    {lvl === 3 && 'Standard chores (45–60 min)'}
                    {lvl === 4 && 'Heavy chores (60–90 min)'}
                    {lvl === 5 && 'Deep clean (90–120 min)'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chores Grid */}
      {chores.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
          <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No chores defined</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add chores to your catalog so the smart algorithm can assign them fairly.
          </p>
          <button
            onClick={handleOpenAdd}
            type="button"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
          >
            Add Chore
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {chores.map((chore) => {
            // Find current week assignment if any
            const currentAssignment = assignments.find(a => a.choreId === chore.id);
            const assignedFlatmate = currentAssignment 
              ? flatmates.find(f => f.id === currentAssignment.flatmateId)
              : null;

            return (
              <div
                key={chore.id}
                className="rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Icon + Category + Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                      <ChoreIcon name={chore.icon} className="w-6 h-6 text-indigo-600" />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(chore)}
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Chore"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmChore(chore)}
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Chore"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Chore Title & Details */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                        {chore.category || 'General'}
                      </span>
                      {chore.estimatedMinutes && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {chore.estimatedMinutes}m
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-slate-900 text-base">
                      {chore.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px]">
                      {chore.description || 'Standard household task.'}
                    </p>
                  </div>

                  {/* Difficulty Tag */}
                  <div className="mt-4">
                    <DifficultyBadge difficulty={chore.difficulty} size="sm" />
                  </div>
                </div>

                {/* Footer: Currently assigned to */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 text-xs flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Assigned to:</span>
                  {assignedFlatmate ? (
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span>{assignedFlatmate.avatar}</span>
                      <span>{assignedFlatmate.name}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Chore Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Household Chore"
        subtitle="Define a chore and set its difficulty level for workload balancing"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Chore Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bathroom Cleaning, Grocery Run, Vacuuming"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Difficulty Level (1 = Easy to 5 = Very Hard) *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const conf = DIFFICULTY_LEVELS[level];
                const isSelected = Number(formData.difficulty) === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? `${conf.bg} ${conf.text} ${conf.border} ring-2 ring-indigo-500 scale-102 font-extrabold`
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>{level}</div>
                    <div className="text-[10px] font-normal">{conf.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Housekeeping">Housekeeping</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Disposal">Disposal</option>
                <option value="Supplies">Supplies</option>
                <option value="Outdoor">Outdoor</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Est. Minutes
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1">
              {AVAILABLE_CHORE_ICONS.map((iconItem) => (
                <button
                  key={iconItem.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconItem.id })}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    formData.icon === iconItem.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600 ring-2 ring-indigo-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title={iconItem.label}
                >
                  <ChoreIcon name={iconItem.id} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Description
            </label>
            <textarea
              rows="2"
              placeholder="Provide simple instructions on how to complete this chore..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              Add Chore
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Chore Modal */}
      <Modal
        isOpen={!!editingChore}
        onClose={() => setEditingChore(null)}
        title={`Edit Chore: ${editingChore?.title}`}
        subtitle="Update difficulty, category, or descriptions"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Chore Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Difficulty Level (1 = Easy to 5 = Very Hard) *
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((level) => {
                const conf = DIFFICULTY_LEVELS[level];
                const isSelected = Number(formData.difficulty) === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? `${conf.bg} ${conf.text} ${conf.border} ring-2 ring-indigo-500 scale-102 font-extrabold`
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div>{level}</div>
                    <div className="text-[10px] font-normal">{conf.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Housekeeping">Housekeeping</option>
                <option value="Kitchen">Kitchen</option>
                <option value="Disposal">Disposal</option>
                <option value="Supplies">Supplies</option>
                <option value="Outdoor">Outdoor</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Est. Minutes
              </label>
              <input
                type="number"
                min="5"
                max="240"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Icon
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1">
              {AVAILABLE_CHORE_ICONS.map((iconItem) => (
                <button
                  key={iconItem.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconItem.id })}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                    formData.icon === iconItem.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600 ring-2 ring-indigo-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                  title={iconItem.label}
                >
                  <ChoreIcon name={iconItem.id} className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Task Description
            </label>
            <textarea
              rows="2"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingChore(null)}
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
        isOpen={!!deleteConfirmChore}
        onClose={() => setDeleteConfirmChore(null)}
        title="Delete Chore"
        subtitle="This action will remove the chore from active rotations"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-bold text-slate-900">{deleteConfirmChore?.title}</span>? Active assignments will be rebalanced automatically.
          </p>
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteConfirmChore(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onDeleteChore(deleteConfirmChore.id);
                setDeleteConfirmChore(null);
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
