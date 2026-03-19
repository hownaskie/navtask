import { useCallback, useEffect, useState } from "react";
import { taskApi } from "../services/api";
import type {
  CreateTaskRequest,
  TaskResponse,
  UpdateTaskRequest,
} from "../interfaces/task";

interface UseTaskOptions {
  autoFetch?: boolean;
}

export const useTask = ({ autoFetch = false }: UseTaskOptions = {}) => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [createTaskLoading, setCreateTaskLoading] = useState<boolean>(false);
  const [updateTaskLoading, setUpdateTaskLoading] = useState<boolean>(false);
  const [deleteTaskLoading, setDeleteTaskLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!autoFetch) {
      setLoading(false);
      return;
    }

    const fetchTasks = async () => {
      try {
        const res = await taskApi.getAll();
        setTasks(res.data.data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [autoFetch]);

  const createTask = async (taskData: CreateTaskRequest) => {
    try {
      setCreateTaskLoading(true);
      await taskApi.create(taskData);
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setCreateTaskLoading(false);
    }
  };

  const getTaskById = useCallback(
    async (id: number): Promise<TaskResponse | null> => {
      try {
        const res = await taskApi.getById(id);
        return res.data.data;
      } catch (err) {
        console.error("Error fetching task by id:", err);
        return null;
      }
    },
    [],
  );

  const updateTask = async (id: number, taskData: UpdateTaskRequest) => {
    try {
      setUpdateTaskLoading(true);
      await taskApi.update(id, taskData);
      return true;
    } catch (err) {
      console.error("Error updating task:", err);
      return false;
    } finally {
      setUpdateTaskLoading(false);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      setDeleteTaskLoading(true);
      await taskApi.delete(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      return true;
    } catch (err) {
      console.error("Error deleting task:", err);
      return false;
    } finally {
      setDeleteTaskLoading(false);
    }
  };

  const deleteTasks = async (taskIds: number[]) => {
    if (taskIds.length === 0) {
      return true;
    }

    try {
      setDeleteTaskLoading(true);
      await taskApi.deleteBatch(taskIds);
      const ids = new Set(taskIds);
      setTasks((prev) => prev.filter((task) => !ids.has(task.id)));
      return true;
    } catch (err) {
      console.error("Error deleting tasks:", err);
      return false;
    } finally {
      setDeleteTaskLoading(false);
    }
  };

  return {
    tasks,
    loading,
    createTask,
    createTaskLoading,
    updateTask,
    updateTaskLoading,
    deleteTask,
    deleteTasks,
    deleteTaskLoading,
    getTaskById,
  };
};
