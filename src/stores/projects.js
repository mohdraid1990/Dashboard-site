import { defineStore } from 'pinia';
import { fetchUsers } from '../services/api';

export const useProjectStore = defineStore('projects', {
  state: () => ({
    projects: JSON.parse(localStorage.getItem('projects')) || [],
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    users: [],
    theme: localStorage.getItem('theme') || 'light',
    language: localStorage.getItem('language') || 'ar',
    notifications: [],
  }),

  actions: {
    async loadUsers() {
      this.users = await fetchUsers();
    },

    addProject(project) {
      if (!project.title) return { error: 'errorTitleRequired' };
      this.projects.push(project);
      this.saveToLocalStorage();
      this.showNotification('تم إضافة المشروع بنجاح', 'Project added successfully');
      return { success: true };
    },

    addTask(task) {
      if (!task.title) return { error: 'errorTaskTitleRequired' };
      if (!task.projectId) return { error: 'errorProjectRequired' };
      this.tasks.push(task);
      this.saveToLocalStorage();
      this.showNotification('تم إضافة المهمة بنجاح', 'Task added successfully');
      return { success: true };
    },

    updateProjectStatus(projectId, status) {
      const project = this.projects.find((p) => p.id === projectId);
      if (project) {
        project.status = status;
        this.saveToLocalStorage();
        this.showNotification('تم تحديث حالة المشروع', 'Project status updated');
      }
    },

    updateTaskStatus(taskId, status) {
      const task = this.tasks.find((t) => t.id === taskId);
      if (task) {
        task.status = status;
        this.saveToLocalStorage();
        this.showNotification('تم تحديث حالة المهمة', 'Task status updated');
      }
    },

    // تعديل مهمة
    updateTask(updatedTask) {
      const index = this.tasks.findIndex((t) => t.id === updatedTask.id);
      if (index === -1) return { error: 'taskNotFound' };
      if (!updatedTask.title) return { error: 'errorTaskTitleRequired' };
      if (!updatedTask.projectId) return { error: 'errorProjectRequired' };

      this.tasks[index] = { ...updatedTask };
      this.saveToLocalStorage();
      this.showNotification('تم تعديل المهمة بنجاح', 'Task updated successfully');
      return { success: true };
    },

    // حذف مهمة
    deleteTask(taskId) {
      const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
      if (taskIndex === -1) return { error: 'taskNotFound' };

      this.tasks.splice(taskIndex, 1);
      this.saveToLocalStorage();
      this.showNotification('تم حذف المهمة بنجاح', 'Task deleted successfully');
      return { success: true };
    },

    // حذف جميع المهام
    deleteAllTasks() {
      this.tasks = [];
      this.saveToLocalStorage();
      this.showNotification('تم حذف جميع المهام بنجاح', 'All tasks deleted successfully');
    },

    // تعديل مشروع
    updateProject(updatedProject) {
      const index = this.projects.findIndex((p) => p.id === updatedProject.id);
      if (index === -1) return { error: 'projectNotFound' };
      if (!updatedProject.title) return { error: 'errorTitleRequired' };

      this.projects[index] = { ...updatedProject };
      this.saveToLocalStorage();
      this.showNotification('تم تعديل المشروع بنجاح', 'Project updated successfully');
      return { success: true };
    },

    // حذف مشروع
    deleteProject(projectId) {
      const projectIndex = this.projects.findIndex((p) => p.id === projectId);
      if (projectIndex === -1) return { error: 'projectNotFound' };

      this.tasks = this.tasks.filter((t) => t.projectId !== projectId);
      this.projects.splice(projectIndex, 1);
      this.saveToLocalStorage();
      this.showNotification('تم حذف المشروع بنجاح', 'Project deleted successfully');
      return { success: true };
    },

    // حذف جميع المشاريع
    deleteAllProjects() {
      this.projects = [];
      this.tasks = [];
      this.saveToLocalStorage();
      this.showNotification('تم حذف جميع المشاريع بنجاح', 'All projects deleted successfully');
    },

    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', this.theme);
    },

    setLanguage(lang) {
      this.language = lang;
      localStorage.setItem('language', lang);
    },

    saveToLocalStorage() {
      localStorage.setItem('projects', JSON.stringify(this.projects));
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    },

    showNotification(arMessage, enMessage) {
      const message = this.language === 'ar' ? arMessage : enMessage;
      this.notifications.push({ id: Date.now(), message });
      if (Notification.permission === 'granted') {
        new Notification(message);
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification(message);
          }
        });
      }
      setTimeout(() => {
        this.notifications = this.notifications.filter((n) => n.id !== this.notifications[0]?.id);
      }, 5000);
    },

    checkDueDates() {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.tasks.forEach((task) => {
        const dueDate = new Date(task.dueDate);
        if (dueDate <= tomorrow && task.status !== 'completed') {
          this.showNotification(
            `تنبيه: المهمة "${task.title}" مستحقة قريباً`,
            `Alert: Task "${task.title}" is due soon`
          );
        }
      });
    },
  },
});