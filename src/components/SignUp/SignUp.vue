<script setup lang="ts">
import { ref, computed } from 'vue'
import './SignUp.css'

// Form data
const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: false
})

// Form validation
const errors = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeToTerms: ''
})

const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Computed properties for validation
const isEmailValid = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(formData.value.email)
})

const isPasswordValid = computed(() => {
  return formData.value.password.length >= 8
})

const doPasswordsMatch = computed(() => {
  return formData.value.password === formData.value.confirmPassword
})

const isFormValid = computed(() => {
  return formData.value.firstName &&
      formData.value.lastName &&
      formData.value.email &&
      isEmailValid.value &&
      isPasswordValid.value &&
      doPasswordsMatch.value &&
      formData.value.agreeToTerms
})

// Methods
const validateField = (field: string) => {
  errors.value[field] = ''

  switch (field) {
    case 'firstName':
      if (!formData.value.firstName) {
        errors.value.firstName = 'First name is required'
      }
      break
    case 'lastName':
      if (!formData.value.lastName) {
        errors.value.lastName = 'Last name is required'
      }
      break
    case 'email':
      if (!formData.value.email) {
        errors.value.email = 'Email is required'
      } else if (!isEmailValid.value) {
        errors.value.email = 'Please enter a valid email address'
      }
      break
    case 'password':
      if (!formData.value.password) {
        errors.value.password = 'Password is required'
      } else if (!isPasswordValid.value) {
        errors.value.password = 'Password must be at least 8 characters long'
      }
      break
    case 'confirmPassword':
      if (!formData.value.confirmPassword) {
        errors.value.confirmPassword = 'Please confirm your password'
      } else if (!doPasswordsMatch.value) {
        errors.value.confirmPassword = 'Passwords do not match'
      }
      break
    case 'agreeToTerms':
      if (!formData.value.agreeToTerms) {
        errors.value.agreeToTerms = 'You must agree to the terms and conditions'
      }
      break
  }
}

const handleSubmit = async () => {
  // Validate all fields
  Object.keys(formData.value).forEach(field => validateField(field))

  if (!isFormValid.value) {
    return
  }

  isLoading.value = true

  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Handle successful signup
    console.log('User registered:', formData.value)
    alert('Registration successful! Welcome aboard!')

    // Reset form
    formData.value = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    }
  } catch (error) {
    console.error('Registration failed:', error)
    alert('Registration failed. Please try again.')
  } finally {
    isLoading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}
</script>

<template>
  <div class="signup-container">
    <!-- Left Side - Welcome Content -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="logo">
          <div class="logo-icon">🚀</div>
          <h1>SignUp Now!!</h1>
        </div>
        <p class="welcome-text">
          Join on the platform to get access to all the features.
        </p>
        <div class="features">
          <div class="feature">
            <span class="feature-icon">✨</span>
            <span>Premium Features</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🔒</span>
            <span>Secure & Private</span>
          </div>
          <div class="feature">
            <span class="feature-icon">🚀</span>
            <span>Fast & Reliable</span>
          </div>
        </div>
        <!-- Sign In Link -->
        <div class="signin-link">
          <p>Already have an account? Click Login Above!!</p>
        </div>
      </div>
    </div>

    <!-- Right Side - Signup Form -->
    <div class="form-section">
      <div class="form-container">
        <div class="form-header">
          <h2>Create Account</h2>
          <p>Fill in your details to get started</p>
        </div>

        <form @submit.prevent="handleSubmit" class="signup-form">
          <!-- Name Fields -->
          <div class="form-row">
            <div class="form-group">
              <label for="firstName" class="form-label">First Name</label>
              <input
                id="firstName"
                v-model="formData.firstName"
                @blur="validateField('firstName')"
                type="text"
                class="form-input"
                :class="{ 'error': errors.firstName }"
                placeholder="First Name"
              />
              <span v-if="errors.firstName" class="error-message">{{ errors.firstName }}</span>
            </div>

            <div class="form-group">
              <label for="lastName" class="form-label">Last Name</label>
              <input
                id="lastName"
                v-model="formData.lastName"
                @blur="validateField('lastName')"
                type="text"
                class="form-input"
                :class="{ 'error': errors.lastName }"
                placeholder="Last Name"
              />
              <span v-if="errors.lastName" class="error-message">{{ errors.lastName }}</span>
            </div>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email" class="form-label">Email Address</label>
            <input
              id="email"
              v-model="formData.email"
              @blur="validateField('email')"
              type="email"
              class="form-input"
              :class="{ 'error': errors.email }"
              placeholder="name@example.com"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="password-input-container">
              <input
                id="password"
                v-model="formData.password"
                @blur="validateField('password')"
                :type="showPassword ? 'text' : 'password'"
                class="form-input password-input"
                :class="{ 'error': errors.password }"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="password-toggle"
              >
                {{ showPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <div class="password-strength">
              <div class="strength-indicators">
                <div class="strength-bar" :class="{ 'active': formData.password.length >= 3 }"></div>
                <div class="strength-bar" :class="{ 'active': formData.password.length >= 6 }"></div>
                <div class="strength-bar" :class="{ 'active': formData.password.length >= 8 }"></div>
              </div>
              <span class="strength-text">
                {{ formData.password.length >= 8 ? 'Strong' : formData.password.length >= 6 ? 'Medium' : formData.password.length >= 3 ? 'Weak' : 'Too short' }}
              </span>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <div class="password-input-container">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                @blur="validateField('confirmPassword')"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input password-input"
                :class="{ 'error': errors.confirmPassword }"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                @click="toggleConfirmPasswordVisibility"
                class="password-toggle"
              >
                {{ showConfirmPassword ? '👁️' : '🙈' }}
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>

          <!-- Terms and Conditions -->
          <div class="form-group">
            <label class="checkbox-container">
              <input
                v-model="formData.agreeToTerms"
                @change="validateField('agreeToTerms')"
                type="checkbox"
                class="checkbox-input"
              />
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">
                I agree to the <a href="#" class="terms-link">Terms</a> and <a href="#" class="terms-link">Privacy Policy</a>
              </span>
            </label>
            <span v-if="errors.agreeToTerms" class="error-message">{{ errors.agreeToTerms }}</span>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="submit-button"
            :disabled="!isFormValid || isLoading"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="!isLoading">Create Account</span>
            <span v-else class="loading-content">
              <span class="loading-spinner"></span>
              Creating...
            </span>
          </button>

          <!-- Social Signup -->
          <div class="social-signup">
            <div class="divider">
              <span>or continue with</span>
            </div>
            <div class="social-buttons">
              <button type="button" class="social-button google">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button type="button" class="social-button github">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </div>

<!--          &lt;!&ndash; Sign In Link &ndash;&gt;-->
<!--          <div class="signin-link">-->
<!--            <p>Already have an account? <a href="#" class="signin-link-text">Sign in</a></p>-->
<!--          </div>-->
        </form>
      </div>
    </div>
  </div>
</template>
