<script setup>
import { ref, defineEmits } from 'vue'
import './UserLogin.css'

const emit = defineEmits(['login'])

const loginForm = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (!loginForm.value.username.trim() || !loginForm.value.password.trim()) {
    errorMessage.value = 'Please enter both username and password'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // Simulate login process - replace with actual authentication
    await new Promise(resolve => setTimeout(resolve, 1000))

    // For demo purposes, accept any non-empty credentials
    // In real app, you'd validate against your backend
    const userData = {
      username: loginForm.value.username,
      email: `${loginForm.value.username}@example.com`,
      fullName: loginForm.value.username.charAt(0).toUpperCase() + loginForm.value.username.slice(1),
      joinDate: new Date().toLocaleDateString(),
      role: 'User'
    }

    // Emit login event with user data
    emit('login', userData)

    // Clear form
    loginForm.value = { username: '', password: '' }
  } catch (error) {
    errorMessage.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h2>User Login</h2>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">Username:</label>
          <input
            id="username"
            v-model="loginForm.username"
            type="text"
            placeholder="Enter your username"
            :disabled="isLoading"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password:</label>
          <input
            id="password"
            v-model="loginForm.password"
            type="password"
            placeholder="Enter your password"
            :disabled="isLoading"
            required
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button 
          type="submit" 
          class="login-button"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>
