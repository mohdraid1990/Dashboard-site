export const localStorageService = {
  saveProjects(projects) {
    localStorage.setItem('projects', JSON.stringify(projects));
  },
  getProjects() {
    return JSON.parse(localStorage.getItem('projects')) || [];
  },
  saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  },
  getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
  },
  saveSettings(settings) {
    localStorage.setItem('settings', JSON.stringify(settings));
  },
  getSettings() {
    return JSON.parse(localStorage.getItem('settings')) || { theme: 'light', lang: 'ar' };
  },
};