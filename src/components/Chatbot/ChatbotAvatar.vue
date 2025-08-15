<script setup>
import { ref } from 'vue'
import './ChatbotAvatar.css'

// State for avatar animations
const isHovered = ref(false)
const isClicked = ref(false)
const isMenuOpen = ref(false)

// Handle mouse enter
const handleMouseEnter = () => {
  isHovered.value = true
}

// Handle mouse leave
const handleMouseLeave = () => {
  isHovered.value = false
}

// Handle click animation and menu toggle
const handleClick = () => {
  isClicked.value = true
  isMenuOpen.value = !isMenuOpen.value

  // Reset click animation after a short delay
  setTimeout(() => {
    isClicked.value = false
  }, 200)
}

// Sample chat options
const chatOptions = [
  { id: 1, text: '💬 Start Chat', icon: '💬' },
  { id: 2, text: '❓ Get Help', icon: '❓' },
  { id: 3, text: '📧 Contact Support', icon: '📧' }
]

const handleOptionClick = (option) => {
  console.log(`Selected: ${option.text}`)
  //TODO chat logic here
  isMenuOpen.value = false
}
</script>

<template>
  <div class="chatbot-container">
    <!-- Popup Menu -->
    <Transition name="menu-slide">
      <div v-if="isMenuOpen" class="chatbot-menu">
        <div class="menu-header">
          <div class="bot-face">🤖</div>
          <div class="bot-greeting">
            <h3>Hi there!</h3>
            <p>How can I help you today?</p>
          </div>
        </div>
        <div class="menu-options">
          <button 
            v-for="option in chatOptions" 
            :key="option.id"
            @click="handleOptionClick(option)"
            class="menu-option"
          >
            <span class="option-icon">{{ option.icon }}</span>
            <span class="option-text">{{ option.text }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Avatar Button -->
    <button
      class="chatbot-avatar"
      :class="{ 
        'hovered': isHovered, 
        'clicked': isClicked,
        'menu-active': isMenuOpen
      }"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @click="handleClick"
    >
      <div class="avatar-inner">
        <div class="bot-icon">🤖</div>
        <div class="pulse-ring"></div>
        <div class="notification-dot" v-if="!isMenuOpen"></div>
      </div>
    </button>
  </div>
</template>
