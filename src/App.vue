<script setup>
import { ref } from 'vue'
import './App.css'
import FileExplorer from './components/Dashboard/FileExplorer.vue'
import UserManager from './components/User/UserManager.vue'
// Import other components as needed

// Component registry - add new components here
const components = ref([
  {
    id: 'file-explorer',
    name: 'File Explorer',
    component: FileExplorer,
    icon: '📁',
    description: 'Browse and manage files'
  },
  {
    id: 'user-manager',
    name: 'User Manager',
    component: UserManager,
    icon: '✅',
    description: 'Manage your User profile'
  }
])

// State to track which component is currently active
const activeComponent = ref(null)

// Function to toggle component visibility
const toggleComponent = (componentId) => {
  if (activeComponent.value === componentId) {
    // If clicking the same component, hide it
    activeComponent.value = null
  } else {
    // Show the selected component
    activeComponent.value = componentId
  }
}

// Function to get the currently active component
const getCurrentComponent = () => {
  return components.value.find(comp => comp.id === activeComponent.value)
}

// Function to check if a component is active
const isComponentActive = (componentId) => {
  return activeComponent.value === componentId
}
</script>

<template>
  <div id="app">
    <h1>Home Management</h1>
    
    <!-- Navigation Buttons -->
    <nav class="component-nav">
      <button
        v-for="component in components"
        :key="component.id"
        @click="toggleComponent(component.id)"
        class="component-button"
        :class="{ 'active': isComponentActive(component.id) }"
        :title="component.description"
      >
        <span class="component-icon">{{ component.icon }}</span>
        <span class="component-name">{{ component.name }}</span>
      </button>
    </nav>
    
    <!-- Component Display Area -->
    <div class="component-container">
      <Transition name="fade" mode="out-in">
        <component 
          v-if="activeComponent" 
          :is="getCurrentComponent()?.component"
          :key="activeComponent"
        />
        <div v-else class="welcome-screen">
          <div class="welcome-icon">🏠</div>
          <h2>Welcome to Home Management</h2>
          <p>Hope you are doing Well !!</p>
        </div>
      </Transition>
    </div>
  </div>
</template>