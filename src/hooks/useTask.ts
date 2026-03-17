import { useEffect, useState } from "react";
import { taskApi } from "../services/api";
import type { CreateTaskRequest, TaskResponse } from '../interfaces/task'

export const useTask = () => {
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [createTaskLoading, setCreateTaskLoading] = useState<boolean>(false);

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
      setCreateTaskLoading(true);
      await taskApi.create(taskData);
    } catch (err) {
      console.error("Error creating task:", err);
    } finally {
      setCreateTaskLoading(false);
    }
  };

  return { tasks, loading, createTask, createTaskLoading };
};