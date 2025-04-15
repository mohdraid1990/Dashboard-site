<script setup>
import { ref, computed, onMounted } from "vue";
import { useProjectStore } from "../stores/projects";
import { useI18n } from "vue-i18n";
import draggable from "vuedraggable";

const store = useProjectStore();
const { t } = useI18n();

// بيانات المهمة الجديدة
const newTask = ref({
  id: "",
  title: "",
  description: "",
  projectId: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  assignedTo: "",
});

// بيانات تعديل المهمة
const editTask = ref(null);

// حالات العرض
const showAddForm = ref(false);
const showEditForm = ref(false);
const errorMessage = ref("");

// إضافة مهمة
const addTask = async () => {
  const result = await store.addTask({
    ...newTask.value,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  });

  if (result.error) {
    errorMessage.value = t(result.error);
    return;
  }

  newTask.value = {
    id: "",
    title: "",
    description: "",
    projectId: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    assignedTo: "",
  };
  showAddForm.value = false;
  errorMessage.value = "";
};

// بدء تعديل مهمة
const startEditTask = (task) => {
  editTask.value = { ...task };
  showEditForm.value = true;
};

// حفظ تعديل المهمة
const saveEditTask = async () => {
  const result = await store.updateTask(editTask.value);
  if (result.error) {
    errorMessage.value = t(result.error);
    return;
  }
  showEditForm.value = false;
  editTask.value = null;
  errorMessage.value = "";
};

// حذف مهمة
const deleteTask = async (taskId) => {
  if (confirm(t("confirmDeleteTask"))) {
    await store.deleteTask(taskId);
  }
};

// حذف جميع المهام
const deleteAllTasks = async () => {
  if (store.tasks.length === 0) {
    errorMessage.value = t("noTasksToDelete");
    return;
  }
  if (confirm(t("confirmDeleteAllTasks"))) {
    await store.deleteAllTasks();
  }
};

// تصفية المهام حسب الحالة (للعرض فقط)
const todoTasks = computed(() =>
  store.tasks.filter((task) => task.status === "todo")
);
const inProgressTasks = computed(() =>
  store.tasks.filter((task) => task.status === "in-progress")
);
const completedTasks = computed(() =>
  store.tasks.filter((task) => task.status === "completed")
);

// التعامل مع السحب والإفلات
const onDrop = (event) => {
  const task = event.item.__draggable_context.element;
  const newStatus = event.to.dataset.status;
  if (task.status !== newStatus) {
    store.updateTaskStatus(task.id, newStatus);
  }
};

// تحميل البيانات عند تحميل المكون
onMounted(() => {
  store.loadUsers();
  store.checkDueDates();
});
</script>

<template>
  <div class="tasks-container animate__animated animate__fadeIn">
    <div class="header">
      <h1>{{ t("tasks") }}</h1>
      <div class="header-actions">
        <button class="add-btn" @click="showAddForm = true">
          {{ t("addTask") }}
        </button>
        <button class="delete-all-btn" @click="deleteAllTasks">
          {{ t("deleteAllTasks") }}
        </button>
      </div>
    </div>

    <!-- نموذج إضافة مهمة -->
    <div v-if="showAddForm" class="add-form animate__animated animate__zoomIn">
      <div class="field">
        <label>{{ t("taskTitle") }} ({{ t("titleExplanation") }})</label>
        <input
          v-model="newTask.title"
          :placeholder="t('taskTitle')"
          type="text"
        />
      </div>
      <div class="field">
        <label
          >{{ t("taskDescription") }} ({{ t("descriptionExplanation") }})</label
        >
        <textarea
          v-model="newTask.description"
          :placeholder="t('taskDescription')"
        ></textarea>
      </div>
      <div class="field">
        <label>{{ t("selectProject") }} ({{ t("projectExplanation") }})</label>
        <select v-model="newTask.projectId">
          <option value="">{{ t("selectProject") }}</option>
          <option
            v-for="project in store.projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.title }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>{{ t("selectUser") }} ({{ t("userExplanation") }})</label>
        <select v-model="newTask.assignedTo">
          <option value="">{{ t("selectUser") }}</option>
          <option v-for="user in store.users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>{{ t("dueDate") }} ({{ t("dueDateExplanation") }})</label>
        <input
          v-model="newTask.dueDate"
          type="date"
          :placeholder="t('dueDate')"
        />
      </div>
      <div class="field">
        <label>{{ t("priority") }} ({{ t("priorityExplanation") }})</label>
        <select v-model="newTask.priority">
          <option value="low">{{ t("low") }}</option>
          <option value="medium">{{ t("medium") }}</option>
          <option value="high">{{ t("high") }}</option>
        </select>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions">
        <button @click="addTask" class="save-btn">{{ t("save") }}</button>
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

    <!-- نموذج تعديل مهمة -->
    <div v-if="showEditForm" class="add-form animate__animated animate__zoomIn">
      <div class="field">
        <label>{{ t("taskTitle") }} ({{ t("titleExplanation") }})</label>
        <input
          v-model="editTask.title"
          :placeholder="t('taskTitle')"
          type="text"
        />
      </div>
      <div class="field">
        <label
          >{{ t("taskDescription") }} ({{ t("descriptionExplanation") }})</label
        >
        <textarea
          v-model="editTask.description"
          :placeholder="t('taskDescription')"
        ></textarea>
      </div>
      <div class="field">
        <label>{{ t("selectProject") }} ({{ t("projectExplanation") }})</label>
        <select v-model="editTask.projectId">
          <option value="">{{ t("selectProject") }}</option>
          <option
            v-for="project in store.projects"
            :key="project.id"
            :value="project.id"
          >
            {{ project.title }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>{{ t("selectUser") }} ({{ t("userExplanation") }})</label>
        <select v-model="editTask.assignedTo">
          <option value="">{{ t("selectUser") }}</option>
          <option v-for="user in store.users" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>
      <div class="field">
        <label>{{ t("dueDate") }} ({{ t("dueDateExplanation") }})</label>
        <input
          v-model="editTask.dueDate"
          type="date"
          :placeholder="t('dueDate')"
        />
      </div>
      <div class="field">
        <label>{{ t("priority") }} ({{ t("priorityExplanation") }})</label>
        <select v-model="editTask.priority">
          <option value="low">{{ t("low") }}</option>
          <option value="medium">{{ t("medium") }}</option>
          <option value="high">{{ t("high") }}</option>
        </select>
      </div>
      <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
      <div class="form-actions">
        <button @click="saveEditTask" class="save-btn">{{ t("save") }}</button>
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

    <!-- لوحة Kanban -->
    <div class="kanban-board">
      <div class="column">
        <h2>{{ t("todo") }}</h2>
        <draggable
          :list="todoTasks"
          group="tasks"
          data-status="todo"
          @end="onDrop"
          item-key="id"
          class="task-list"
        >
          <template #item="{ element }">
            <div class="task-card animate__animated animate__bounceIn">
              <div class="card-header">
                <h3>{{ element.title }}</h3>
                <span :class="['priority-badge', element.priority]">
                  {{ t(element.priority) }}
                </span>
              </div>
              <p class="description">{{ element.description }}</p>
              <div class="card-footer">
                <span class="due-date">{{ element.dueDate }}</span>
                <span class="project-name">
                  {{
                    store.projects.find((p) => p.id === element.projectId)
                      ?.title || "غير محدد"
                  }}
                </span>
                <span class="assigned-to">
                  {{
                    store.users.find((u) => u.id === element.assignedTo)
                      ?.name || "غير معين"
                  }}
                </span>
              </div>
              <div class="card-actions">
                <button @click="startEditTask(element)" class="edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteTask(element.id)" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <div class="column">
        <h2>{{ t("inProgress") }}</h2>
        <draggable
          :list="inProgressTasks"
          group="tasks"
          data-status="in-progress"
          @end="onDrop"
          item-key="id"
          class="task-list"
        >
          <template #item="{ element }">
            <div class="task-card animate__animated animate__bounceIn">
              <div class="card-header">
                <h3>{{ element.title }}</h3>
                <span :class="['priority-badge', element.priority]">
                  {{ t(element.priority) }}
                </span>
              </div>
              <p class="description">{{ element.description }}</p>
              <div class="card-footer">
                <span class="due-date">{{ element.dueDate }}</span>
                <span class="project-name">
                  {{
                    store.projects.find((p) => p.id === element.projectId)
                      ?.title || "غير محدد"
                  }}
                </span>
                <span class="assigned-to">
                  {{
                    store.users.find((u) => u.id === element.assignedTo)
                      ?.name || "غير معين"
                  }}
                </span>
              </div>
              <div class="card-actions">
                <button @click="startEditTask(element)" class="edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteTask(element.id)" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>

      <div class="column">
        <h2>{{ t("completed") }}</h2>
        <draggable
          :list="completedTasks"
          group="tasks"
          data-status="completed"
          @end="onDrop"
          item-key="id"
          class="task-list"
        >
          <template #item="{ element }">
            <div class="task-card animate__animated animate__bounceIn">
              <div class="card-header">
                <h3>{{ element.title }}</h3>
                <span :class="['priority-badge', element.priority]">
                  {{ t(element.priority) }}
                </span>
              </div>
              <p class="description">{{ element.description }}</p>
              <div class="card-footer">
                <span class="due-date">{{ element.dueDate }}</span>
                <span class="project-name">
                  {{
                    store.projects.find((p) => p.id === element.projectId)
                      ?.title || "غير محدد"
                  }}
                </span>
                <span class="assigned-to">
                  {{
                    store.users.find((u) => u.id === element.assignedTo)
                      ?.name || "غير معين"
                  }}
                </span>
              </div>
              <div class="card-actions">
                <button @click="startEditTask(element)" class="edit-btn">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="deleteTask(element.id)" class="delete-btn">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "../assets/styles/variables";
@import "../assets/styles/mixins";

.tasks-container {

  max-width: 1400px;
  margin: 0 auto;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 20px;

    h1 {
      margin: 0;
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

  .kanban-board {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
    min-height: 600px;
        justify-content: center;

    .column {
      background-color: $tan-color;
      border-radius: 12px;
      padding: 1rem;
      @include transition-all;
      display: flex;
      align-items: center;
      flex-direction: column;

      .dark & {
        background-color: $dark-bg;
      }

      h2 {
        margin: 0 0 1rem;
        font-size: 1.25rem;
        color: $dark-bg;

        .dark & {
          color: #ddd;
        }
      }

      .task-list {
        min-height: 100px;
      }

      .task-card {
        background-color: white;
        border-radius: 12px;
        padding: 1rem;
        margin-bottom: 1rem;
        box-shadow: $shadow;
        cursor: move;
        width: 270px;
        @include transition-all;

        .dark & {
          background-color: #475a63;
        }

        &:hover {
          transform: translateY(-4px);
          box-shadow: $shadow-hover;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;

          h3 {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: $secondary-color;

            .dark & {
              color: $light-bg;
            }
          }

          .priority-badge {
            padding: 0.25rem 0.75rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 500;

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

        .description {
          font-size: 0.875rem;
          color: #666;
          margin-bottom: 0.5rem;

          .dark & {
            color: #ddd;
          }
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #666;
          flex-wrap: wrap;

          .dark & {
            color: #ddd;
          }

          .assigned-to {
            margin-left: 0.5rem;
          }
        }

        .card-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;

          button {
            @include button;
            padding: 0.5rem;
            width: 36px;
            height: 36px;
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
  }
}

@media (max-width: 800px) {
  .kanban-board {
    grid-template-columns: repeat(1, 1fr) !important;
  }
  .tasks-container .header {
    justify-content: center;
  }
}
</style>
