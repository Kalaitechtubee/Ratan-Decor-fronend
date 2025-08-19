// src/hooks/useUserTypes.js
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

export default function useUserTypes(options = { autoFetch: true }) {
  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserTypes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getUserTypes();
      setUserTypes(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(api.formatError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const getById = useCallback(async (id) => {
    try {
      return await api.getUserTypeById(id);
    } catch (err) {
      throw err;
    }
  }, []);

  const create = useCallback(async (payload) => {
    const res = await api.createUserType(payload);
    await fetchUserTypes();
    return res;
  }, [fetchUserTypes]);

  const update = useCallback(async (id, payload) => {
    const res = await api.updateUserTypeById(id, payload);
    await fetchUserTypes();
    return res;
  }, [fetchUserTypes]);

  const remove = useCallback(async (id) => {
    const res = await api.deleteUserTypeById(id);
    await fetchUserTypes();
    return res;
  }, [fetchUserTypes]);

  const getStats = useCallback(async () => {
    return await api.getUserTypeStatsOverview();
  }, []);

  const assignToUser = useCallback(async (userId, userTypeId) => {
    return await api.assignUserType(userId, userTypeId);
  }, []);

  useEffect(() => {
    if (options?.autoFetch) fetchUserTypes();
  }, [fetchUserTypes, options?.autoFetch]);

  const value = useMemo(() => ({
    userTypes,
    loading,
    error,
    fetchUserTypes,
    getById,
    create,
    update,
    remove,
    getStats,
    assignToUser,
  }), [userTypes, loading, error, fetchUserTypes, getById, create, update, remove, getStats, assignToUser]);

  return value;
}

