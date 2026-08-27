import React, { useState, useEffect, useCallback } from 'react';
import { getRecords, getStats, updateRecord, deleteRecord } from '../services/recordService';
import StatsCards from './StatsCards';
import RecordsTable from './RecordsTable';
import { Shield, RefreshCw } from 'lucide-react';

const AdminDashboard = ({ showToast }) => {
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const data = await getStats();
      setStats(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch analytics.', 'error');
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRecords = useCallback(async (searchQuery, sortOption) => {
    setLoadingRecords(true);
    try {
      const data = await getRecords(searchQuery, sortOption);
      setRecords(data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch user records.', 'error');
    } finally {
      setLoadingRecords(false);
    }
  }, [showToast]);

  // Debounced records fetch for searching/sorting
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchRecords(search, sort);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, sort, fetchRecords]);

  // Initial fetch of analytics stats
  useEffect(() => {
    fetchStats();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecords(search, sort)]);
    setRefreshing(false);
    showToast('Dashboard data refreshed.', 'success');
  };

  const handleEditRecord = async (id, name, dob) => {
    try {
      const res = await updateRecord(id, name, dob);
      showToast(res.message || 'Record updated successfully.', 'success');
      fetchStats();
      fetchRecords(search, sort);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update record.', 'error');
    }
  };

  const handleDeleteRecord = async (id) => {
    try {
      const res = await deleteRecord(id);
      showToast(res.message || 'Record deleted successfully.', 'success');
      fetchStats();
      fetchRecords(search, sort);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete record.', 'error');
    }
  };

  return (
    <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Title Block */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gray-900 border border-gray-800 text-white rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight sm:text-3xl">
              Private Admin Dashboard
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-primary-600 mt-0.5">
              Secure Data Owner Access Only
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 bg-white text-sm font-semibold text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Analytics Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Database Analytics</h2>
        {loadingStats && !stats ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-150 p-5 shadow-sm animate-pulse h-[106px]" />
            ))}
          </div>
        ) : (
          <StatsCards stats={stats} />
        )}
      </section>

      {/* Management Table */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Calculated Records</h2>
        <RecordsTable
          records={records}
          loading={loadingRecords}
          search={search}
          setSearch={setSearch}
          sort={sort}
          setSort={setSort}
          onEdit={handleEditRecord}
          onDelete={handleDeleteRecord}
        />
      </section>
    </main>
  );
};

export default AdminDashboard;
