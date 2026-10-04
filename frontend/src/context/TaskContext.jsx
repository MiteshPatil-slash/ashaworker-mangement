import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ totalPending: 0, urgent: 0, high: 0, normal: 0 });
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await api.getTasks();
      if (res.success) {
        setTasks(res.tasks || []);
        setSummary(res.summary || { totalPending: 0, urgent: 0, high: 0, normal: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch smart tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const completeTask = async (id) => {
    try {
      await api.completeTask(id);
      setTasks(prev => prev.filter(t => t._id !== id && t.id !== id));
      setSummary(prev => ({ ...prev, totalPending: Math.max(0, prev.totalPending - 1) }));
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        summary,
        loading,
        fetchTasks,
        completeTask
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
