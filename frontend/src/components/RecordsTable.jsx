import React, { useState } from 'react';
import { Search, Edit2, Trash2, Calendar, User, X, AlertTriangle } from 'lucide-react';

const RecordsTable = ({
  records,
  onEdit,
  onDelete,
  search,
  setSearch,
  sort,
  setSort,
  loading,
}) => {
  const [editingRecord, setEditingRecord] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editError, setEditError] = useState('');

  const [deletingRecordId, setDeletingRecordId] = useState(null);

  // Edit Modal controls
  const openEditModal = (record) => {
    setEditingRecord(record);
    setEditName(record.name);
    // Format DOB to YYYY-MM-DD for date input
    const formattedDob = new Date(record.dateOfBirth).toISOString().split('T')[0];
    setEditDob(formattedDob);
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingRecord(null);
    setEditName('');
    setEditDob('');
    setEditError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim() || editName.trim().length < 2) {
      setEditError('Name must be at least 2 characters.');
      return;
    }
    if (!editDob) {
      setEditError('Date of birth is required.');
      return;
    }
    if (new Date(editDob) > new Date()) {
      setEditError('Date of birth cannot be in the future.');
      return;
    }

    onEdit(editingRecord._id, editName.trim(), editDob);
    closeEditModal();
  };

  // Delete controls
  const confirmDelete = (id) => {
    setDeletingRecordId(id);
  };

  const handleDelete = () => {
    onDelete(deletingRecordId);
    setDeletingRecordId(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Controls: Search and Sort */}
      <div className="p-5 border-b border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-950 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-sm font-semibold text-gray-500 whitespace-nowrap">
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="block py-2 px-3 border border-gray-200 bg-gray-50 text-sm text-gray-950 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 transition-all"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="age-asc">Age Low-High</option>
            <option value="age-desc">Age High-Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-left">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Date of Birth
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Current Age
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th scope="col" className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-600"></div>
                    <span>Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500">
                  No records match your search criteria.
                </td>
              </tr>
            ) : (
              records.map((record, index) => (
                <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-500">
                    {index + 1}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">
                    {record.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {formatDate(record.dateOfBirth)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 font-medium">
                    {record.age.years} yrs {record.age.months > 0 && `${record.age.months} mos`} {record.age.days > 0 && `${record.age.days} d`}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                    {formatDate(record.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(record)}
                      className="text-primary-600 hover:text-primary-900 mr-4 font-semibold inline-flex items-center gap-1 hover:bg-primary-50 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <Edit2 className="w-4.5 h-4.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => confirmDelete(record._id)}
                      className="text-rose-600 hover:text-rose-900 font-semibold inline-flex items-center gap-1 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-md w-full shadow-xl border border-gray-100 overflow-hidden animate-scale-up">
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Record</h3>
              <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-50 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="bg-rose-50 text-rose-800 text-sm p-3 rounded-lg border border-rose-100 font-medium">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 text-gray-950 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300 text-gray-950 transition-all text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 bg-white rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingRecordId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-40 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-2xl max-w-sm w-full shadow-xl border border-gray-100 p-6 animate-scale-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Record</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 font-medium">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingRecordId(null)}
                className="px-4 py-2 border border-gray-200 text-sm font-semibold text-gray-700 bg-white rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-lg hover:bg-rose-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordsTable;
