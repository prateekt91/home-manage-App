import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { userStore } from './stores/userStore.js'

// Initialize user store
userStore.init()

createApp(App).mount('#app')
