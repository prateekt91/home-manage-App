<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import './App.css'
import FileExplorer from './components/Dashboard/FileExplorer.vue'
import MyInfo from './components/User/MyInfo.vue'
import UserLogin from './components/Login/UserLogin.vue'
import SignUp from './components/SignUp/SignUp.vue'
import ChatbotAvatar from './components/Chatbot/ChatbotAvatar.vue'
import { userStore } from './stores/userStore.js'

// Initialize user store
onMounted(() => {
  userStore.init()
})

// Component registry - add new components here
const components = ref([
  {
    id: 'user-login',
    name: 'Login',
    component: UserLogin,
    icon: '🔐',
    description: 'User login',
    requiresAuth: false
  },
  {
    id: 'signup',
    name: 'Sign Up',
    component: SignUp,
    icon: '✨',
    description: 'Create a new account',
    requiresAuth: false
  },
  {
    id: 'file-explorer',
    name: 'File Explorer',
    component: FileExplorer,
    icon: '📁',
    description: 'Browse and manage files',
    requiresAuth: true
  },
  {
    id: 'my-info',
    name: 'My Information',
    component: MyInfo,
    icon: '✅',
    description: 'Manage your profile',
    requiresAuth: true
  }
])

// State to track which component is currently active
const activeComponent = ref(null)

// Get visible components based on login status
const visibleComponents = computed(() => {
  if (userStore.isLoggedIn.value) {
    // Show components that require auth (File Explorer and My Info)
    return components.value.filter(comp => comp.requiresAuth === true)
  } else {
    // Show only components that don't require authentication (Login and SignUp)
    return components.value.filter(comp => comp.requiresAuth === false)
  }
})

// Handle user login
const handleUserLogin = (userData) => {
  userStore.login(userData)
  // Switch to My Info after successful login
  activeComponent.value = 'my-info'
}

// Handle user logout
const handleLogout = () => {
  userStore.logout()
  activeComponent.value = null
}

// Watch for login status changes and update active component if necessary
watch(() => userStore.isLoggedIn.value, (isLoggedIn) => {
  if (!isLoggedIn) {
    // User logged out, reset to null
    activeComponent.value = null
  }
  // If user just logged in, the handleUserLogin will set the active component
})

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
    <div class="app-header">
      <div class="header-left">
        <h1>My Hub</h1>
      </div>

      <div class="header-center">
        <!-- Navigation Buttons in the center -->
        <nav class="component-nav">
          <button
            v-for="component in visibleComponents"
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
      </div>

      <div class="header-right">
        <!-- User Section -->
        <div v-if="userStore.isLoggedIn.value" class="user-section">
          <div class="user-status">
            Welcome, {{ userStore.currentUser.value.fullName || userStore.currentUser.value.username }}!
          </div>
          <button @click="handleLogout" class="logout-btn">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Component Display Area -->
    <div class="component-container">
      <Transition name="fade" mode="out-in">
        <component 
          v-if="activeComponent" 
          :is="getCurrentComponent()?.component"
          :key="activeComponent"
          @login="handleUserLogin"
        />
        <div v-else class="welcome-screen">
          <div class="welcome-icon">🏠</div>
          <h2>Welcome to My Hub</h2>
          <p v-if="!userStore.isLoggedIn.value">Please login or sign up to get started!</p>
          <p v-else>Hope you are doing Well, {{ userStore.currentUser.value.fullName || userStore.currentUser.value.username }}!!</p>
        </div>
      </Transition>
    </div>

    <!-- Chatbot Avatar -->
    <ChatbotAvatar />
  </div>
</template>