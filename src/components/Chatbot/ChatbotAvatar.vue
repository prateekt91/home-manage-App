<script setup>
import { ref, nextTick } from 'vue'
import './ChatbotAvatar.css'

// State for avatar animations
const isHovered = ref(false)
const isClicked = ref(false)
const isMenuOpen = ref(false)
const isChatOpen = ref(false)
const isContactSupportOpen = ref(false)

// Chat state
const messages = ref([
  { id: 1, text: 'Hello! How can I help you today?', sender: 'bot', timestamp: new Date() }
])
const currentMessage = ref('')
const isTyping = ref(false)

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
  isMenuOpen.value = false

  if (option.id === 1) {
    // Start Chat - Open the chatbox
    isChatOpen.value = true
  } else if (option.id === 2) {
    // Get Help logic

  } else if (option.id === 3) {
    // Contact Support logic
    isContactSupportOpen.value = true
  }
}

// Chat functionality
const sendMessage = async () => {
  if (!currentMessage.value.trim()) return

  // Add user message
  const userMessage = {
    id: messages.value.length + 1,
    text: currentMessage.value,
    sender: 'user',
    timestamp: new Date()
  }
  messages.value.push(userMessage)

  const messageText = currentMessage.value
  currentMessage.value = ''

  // Show typing indicator
  isTyping.value = true

  // Simulate bot response after a delay
  setTimeout(() => {
    const botResponse = {
      id: messages.value.length + 1,
      text: generateBotResponse(messageText),
      sender: 'bot',
      timestamp: new Date()
    }
    messages.value.push(botResponse)
    isTyping.value = false

    // Scroll to bottom
    nextTick(() => {
      const chatMessages = document.querySelector('.chat-messages')
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight
      }
    })
  }, 1000 + Math.random() * 2000)
}

const generateBotResponse = (userMessage) => {
  const responses = [
    "That's a great question! Let me help you with that.",
    "I understand what you're asking. Here's what I think...",
    "Thanks for reaching out! I'm here to assist you.",
    "Let me provide you with some information about that.",
    "I'm happy to help! Based on what you've said..."
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

const closeChatbox = () => {
  isChatOpen.value = false
}

const closeContactSupport = () => {
  isContactSupportOpen.value = false
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    // Could add a toast notification here
    console.log('Copied to clipboard:', text)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const handleKeyPress = (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="chatbot-container">
    <!-- Chatbox -->
    <Transition name="chatbox-slide">
      <div v-if="isChatOpen" class="chatbox">
        <div class="chatbox-header">
          <div class="header-info">
            <div class="bot-avatar">🤖</div>
            <div class="header-text">
              <h3>AI Assistant</h3>
              <p class="status">Online</p>
            </div>
          </div>
          <button @click="closeChatbox" class="close-button">×</button>
        </div>

        <div class="chat-messages">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['message', message.sender]"
          >
            <div class="message-bubble">
              <p>{{ message.text }}</p>
              <span class="timestamp">
                {{ message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
              </span>
            </div>
          </div>

          <div v-if="isTyping" class="message bot typing">
            <div class="message-bubble">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input">
          <div class="input-container">
            <textarea
              v-model="currentMessage"
              @keypress="handleKeyPress"
              placeholder="Type your message..."
              class="message-input"
              rows="1"
            ></textarea>
            <button 
              @click="sendMessage"
              :disabled="!currentMessage.trim()"
              class="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="m5 12 7-7 7 7M12 19V5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Contact Support Modal -->
    <Transition name="support-modal">
      <div v-if="isContactSupportOpen" class="support-modal">
        <div class="support-content">
          <div class="support-header">
            <div class="support-icon">📞</div>
            <div class="support-title">
              <h2>Contact Support</h2>
              <p>We're here to help you 24/7</p>
            </div>
            <button @click="closeContactSupport" class="close-button">×</button>
          </div>

          <div class="support-body">
            <div class="contact-section">
              <div class="contact-item">
                <div class="contact-icon">📞</div>
                <div class="contact-details">
                  <h3>Phone Support</h3>
                  <p class="contact-value">+91 8095809909</p>
                  <p class="contact-info">Available 24/7</p>
                  <button 
                    @click="copyToClipboard('+91 8095809909')"
                    class="copy-button"
                  >
                    📋 Copy Number
                  </button>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon">✉️</div>
                <div class="contact-details">
                  <h3>Email Support</h3>
                  <p class="contact-value">support@myhub.com</p>
                  <p class="contact-info">Response within 24 hours</p>
                  <button 
                    @click="copyToClipboard('support@myhub.com')"
                    class="copy-button"
                  >
                    📋 Copy Email
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>

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
