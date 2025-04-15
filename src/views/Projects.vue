<script setup>
import { ref, computed, onMounted } from "vue";
import { useProjectStore } from "../stores/projects";
import { useI18n } from "vue-i18n";

const store = useProjectStore();
const { t } = useI18n();


const newProject = ref({
  id: "",
  title: "",
  description: "",
  status: "pending",
  dueDate: "",
  priority: "medium",
});


const searchQuery = ref("");

// بيانات التعديل
const editProject = ref(null);

// حالات العرض
const showAddForm = ref(false);
const showEditForm = ref(false);
const errorMessage = ref("");

// إضافة مشروع
const addProject = async () => {
  const result = await store.addProject({
    ...newProject.value,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  });

  if (result.error) {
    errorMessage.value = t(result.error);
    return;
  }

  newProject.value = {
    id: "",
    title: "",
    description: "",
    status: "pending",
    dueDate: "",
    priority: "medium",
  };
  showAddForm.value = false;
  errorMessage.value = "";
};

// تعديل مشروع
const startEditProject = (project) => {
  editProject.value = { ...project };
  showEditForm.value = true;
};

const saveEditProject = async () => {
  const result = await store.updateProject(editProject.value);
  if (result.error) {
    errorMessage.value = t(result.error);
    return;
  }
  showEditForm.value = false;
  editProject.value = null;
  errorMessage.value = "";
};

// حذف مشروع
const deleteProject = async (projectId) => {
  if (confirm(t("confirmDelete"))) {
    await store.deleteProject(projectId);
  }
};

// حذف جميع المشاريع
const deleteAllProjects = async () => {
  if (store.projects.length === 0) {
    errorMessage.value = t("noProjectsToDelete");
    return;
  }
  if (confirm(t("confirmDeleteAll"))) {
    await store.deleteAllProjects();
  }
};

// تصفية المشاريع بناءً على البحث
const filteredProjects = computed(() => {
  if (!searchQuery.value) return store.projects;
  return store.projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});


const statusClasses = {
  pending: "bg-yellow",
  "in-progress": "bg-blue",
  completed: "bg-green",
};
</script>

<template>
  <div class="projects-container">
    <div class="header">
      <h1>{{ t("projects") }}</h1>
      <div class="header-actions">
        <input
          v-model="searchQuery"
          :placeholder="t('searchProjects')"
          type="text"
          class="search-input"
        />
        <button class="add-btn" @click="showAddForm = true">
          {{ t("addProject") }}
        </button>
        <button class="delete-all-btn" @click="deleteAllProjects">
          {{ t("deleteAll") }}
        </button>
      </div>
    </div>

    <!-- نموذج إضافة مشروع -->
    <div v-if="showAddForm" class="add-form">
      <div class="field">
        <label>{{ t("projectTitle") }} ({{ t("titleExplanation") }})</label>
        <input
          v-model="newProject.title"
          :placeholder="t('projectTitle')"
          type="text"
        />
      </div>
      <div class="field">
        <label
          >{{ t("projectDescription") }} ({{
            t("descriptionExplanation")
          }})</label
        >
        <textarea
          v-model="newProject.description"
          :placeholder="t('projectDescription')"
        ></textarea>
      </div>
      <div class="field">
        <label>{{ t("dueDate") }} ({{ t("dueDateExplanation") }})</label>
        <input
          v-model="newProject.dueDate"
          type="date"
          :placeholder="t('dueDate')"
        />
      </div>
      <div class="field">
        <label>{{ t("priority") }} ({{ t("priorityExplanation") }})</label>
        <select v-model="newProject.priority">
          <option value="low">{{ t("low") }}</option>
          <option value="medium">{{ t("medium") }}</option>
          <option value="high">{{ t("high") }}</option>
        </select>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions">
        <button @click="addProject" class="save-btn">{{ t("save") }}</button>
        <button
          @click="
            showAddForm = false;
            errorMessage = '';
          "
          class="cancel-btn"
        >
          {{ t("cancel") }}
        </button>
      </div>
    </div>

    <!-- نموذج تعديل مشروع -->
    <div v-if="showEditForm" class="add-form">
      <div class="field">
        <label>{{ t("projectTitle") }} ({{ t("titleExplanation") }})</label>
        <input
          v-model="editProject.title"
          :placeholder="t('projectTitle')"
          type="text"
        />
      </div>
      <div class="field">
        <label
          >{{ t("projectDescription") }} ({{
            t("descriptionExplanation")
          }})</label
        >
        <textarea
          v-model="editProject.description"
          :placeholder="t('projectDescription')"
        ></textarea>
      </div>
      <div class="field">
        <label>{{ t("dueDate") }} ({{ t("dueDateExplanation") }})</label>
        <input
          v-model="editProject.dueDate"
          type="date"
          :placeholder="t('dueDate')"
        />
      </div>
      <div class="field">
        <label>{{ t("priority") }} ({{ t("priorityExplanation") }})</label>
        <select v-model="editProject.priority">
          <option value="low">{{ t("low") }}</option>
          <option value="medium">{{ t("medium") }}</option>
          <option value="high">{{ t("high") }}</option>
        </select>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions">
        <button @click="saveEditProject" class="save-btn">
          {{ t("save") }}
        </button>
        <button
          @click="
            showEditForm = false;
            errorMessage = '';
          "
          class="cancel-btn"
        >
          {{ t("cancel") }}
        </button>
      </div>
    </div>

    <!-- شبكة المشاريع -->
    <div class="projects-grid">
      <div
        v-for="project in filteredProjects"
        :key="project.id"
        class="project-card"
      >
        <div class="card-header">
          <h3>{{ project.title }}</h3>
          <span :class="['status-badge', statusClasses[project.status]]">
            {{ t(project.status) }}
          </span>
        </div>
        <p class="description">{{ project.description }}</p>
        <div class="card-footer">
          <span class="due-date"
            >{{ t("dueDate") }}: {{ project.dueDate }}</span
          >
          <span :class="['priority', project.priority]">{{
            t(project.priority)
          }}</span>
        </div>
        <div class="card-actions">
          <select
            v-model="project.status"
            @change="store.updateProjectStatus(project.id, project.status)"
          >
            <option value="pending">{{ t("pending") }}</option>
            <option value="in-progress">{{ t("inProgress") }}</option>
            <option value="completed">{{ t("completed") }}</option>
          </select>
          <div class="action-buttons">
            <button @click="startEditProject(project)" class="edit-btn">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteProject(project.id)" class="delete-btn">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
      <p v-if="filteredProjects.length === 0" class="no-projects">
        {{ t("noProjectsFound") }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/variables";
@import "../assets/styles/mixins";

.projects-container {
  padding: 2rem;
  max-width: 1280px;
  margin: 0 auto;

  .header {
    display: flex;
    align-items: center;
    margin-bottom: 2rem;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 40px;

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: $secondary-color;

      .dark & {
        color: $dark-bg;
      }
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;

      .search-input {
        padding: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 1rem;
        width: 250px;
        @include transition-all;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 5px rgba(66, 185, 131, 0.3);
        }

        .dark & {
          background-color: #3a4a5b;
          border-color: #486581;
          color: $light-bg;
        }
      }

      .add-btn {
        @include button;
        background: $primary-color;
        color: white;

        &:hover {
          background-color: darken($primary-color, 10%);
          transform: scale(1.05);
        }
      }

      .delete-all-btn {
        @include button;
        background: $danger-color;
        color: white;

        &:hover {
          background-color: darken($danger-color, 10%);
          transform: scale(1.05);
        }
      }
    }
  }

  .add-form {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: $shadow;
    margin-bottom: 2rem;
    @include transition-all;

    .dark & {
      background-color: $dark-bg;
    }

    .field {
      margin-bottom: 1.25rem;

      label {
        display: block;
        font-size: 0.9rem;
        color: $secondary-color;
        margin-bottom: 0.5rem;

        .dark & {
          color: $light-bg;
        }
      }

      input,
      textarea,
      select {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 1rem;
        @include transition-all;

        &:focus {
          outline: none;
          border-color: $primary-color;
          box-shadow: 0 0 5px rgba(66, 185, 131, 0.3);
        }

        .dark & {
          background-color: #3a4a5b;
          border-color: #486581;
          color: $light-bg;
        }
      }

      textarea {
        min-height: 120px;
        resize: vertical;
      }
    }

    .error {
      color: $danger-color;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;

      button {
        @include button;
        flex: 1;

        &.save-btn {
          background-color: $primary-color;
          color: white;

          &:hover {
            background-color: darken($primary-color, 10%);
          }
        }

        &.cancel-btn {
          background-color: $danger-color;
          color: white;

          &:hover {
            background-color: darken($danger-color, 10%);
          }
        }
      }
    }
  }

  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 2rem;
    justify-content: center;

    .project-card {
      background-color: white;
      border-radius: 12px;
      box-shadow: $shadow;
      padding: 1.5rem;
      @include transition-all;

      .dark & {
        background-color: $dark-bg;
      }

      &:hover {
        transform: translateY(-6px);
        box-shadow: $shadow-hover;
      }

      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;

        h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: $secondary-color;

          .dark & {
            color: $light-bg;
          }
        }

        .status-badge {
          padding: 0.3rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;

          &.bg-yellow {
            background-color: $warning-color;
            color: $secondary-color;
          }

          &.bg-blue {
            background-color: #3498db;
            color: white;
          }

          &.bg-green {
            background-color: $success-color;
            color: white;
          }
        }
      }

      .description {
        font-size: 0.95rem;
        color: #666;
        margin-bottom: 1rem;

        .dark & {
          color: #ddd;
        }
      }

      .card-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.9rem;
        color: $secondary-color;

        .dark & {
          color: $light-bg;
        }

        .priority {
          padding: 0.3rem 0.75rem;
          border-radius: 20px;

          &.high {
            background-color: $danger-color;
            color: white;
          }

          &.medium {
            background-color: $warning-color;
            color: $secondary-color;
          }

          &.low {
            background-color: $success-color;
            color: white;
          }
        }
      }

      .card-actions {
        margin-top: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;

        select {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.7rem;
          @include transition-all;

          &:focus {
            outline: none;
            border-color: $primary-color;
          }

          .dark & {
            background-color: #3a4a5b;
            border-color: #486581;
            color: $light-bg;
          }
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;

          button {
            @include button;
            padding: 0.5rem;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;

            &.edit-btn {
              background-color: #3498db;
              color: white;

              &:hover {
                background-color: darken(#3498db, 10%);
              }
            }

            &.delete-btn {
              background-color: $danger-color;
              color: white;

              &:hover {
                background-color: darken($danger-color, 10%);
              }
            }
          }
        }
      }
    }

    .no-projects {
      grid-column: 1 / -1;
      text-align: center;
      font-size: 1.2rem;
      color: #666;

      .dark & {
        color: $dark-bg;
      }
    }
  }
}
@media (max-width: 500px) {
  .projects-container .header {
    justify-content: center;
  }
}
</style>
