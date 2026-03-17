import { useEffect, useState } from "react";
import { taskApi } from "../services/api";
import type { CreateTaskRequest, TaskResponse } from "../types/task";

export const useTask = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  useEffect(() => {
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
  }, []);

  const createTask = async (taskData: CreateTaskRequest) => {
    try {
      setCreateLoading(true);
      await taskApi.create(taskData);
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setCreateLoading(false);
    }
  };

  return { tasks, loading, createTask, createLoading };
};