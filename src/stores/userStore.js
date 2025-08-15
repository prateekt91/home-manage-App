import { ref, computed } from 'vue'

// User state
const currentUser = ref(null)
const isLoggedIn = computed(() => currentUser.value !== null)

// User actions
export const userStore = {
  // State
  currentUser,
  isLoggedIn,

  // Actions
  login(userData) {
    currentUser.value = userData
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(userData))
  },

  logout() {
    currentUser.value = null
    localStorage.removeItem('currentUser')
  },

  // Initialize from localStorage if available
  init() {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored)
      } catch (e) {
        console.error('Error parsing stored user data:', e)
        localStorage.removeItem('currentUser')
      }
    }
  }
}
