<script setup>
import { ref, computed } from 'vue'
import './Dashboard.css'

// Mock file system data
const files = ref([
  {
    id: 1,
    name: 'project-overview.md',
    type: 'markdown',
    size: '2.1 KB',
    modified: '2025-01-15',
    content: `# Project Overview

This is a comprehensive project documentation file that contains important information about the system architecture and implementation details.

## Features
- File management system
- Preview functionality
- Modern UI design
- Responsive layout

## Technical Details
Built with Vue 3 and modern JavaScript practices.`
  },
  {
    id: 2,
    name: 'config.json',
    type: 'json',
    size: '1.3 KB',
    modified: '2025-01-14',
    content: `{
  "version": "1.0.0",
  "name": "Dashboard App",
  "description": "A modern file management dashboard",
  "settings": {
    "theme": "dark",
    "autoSave": true,
    "previewMode": "enhanced"
  },
  "features": [
    "file-preview",
    "search",
    "filter",
    "responsive-design"
  ]
}`
  },
  {
    id: 3,
    name: 'styles.css',
    type: 'css',
    size: '5.7 KB',
    modified: '2025-01-13',
    content: `/* Dashboard Styles */
.dashboard {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 1rem;
  height: 100vh;
}

.file-viewer {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.preview-pane {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}`
  },
  {
    id: 4,
    name: 'script.js',
    type: 'javascript',
    size: '3.2 KB',
    modified: '2025-01-12',
    content: `// Dashboard functionality
class FileManager {
  constructor() {
    this.selectedFile = null;
    this.files = [];
  }

  selectFile(file) {
    this.selectedFile = file;
    this.updatePreview();
  }

  updatePreview() {
    if (this.selectedFile) {
      console.log('Previewing:', this.selectedFile.name);
    }
  }
}

const fileManager = new FileManager();
export default fileManager;`
  },
  {
    id: 5,
    name: 'README.txt',
    type: 'text',
    size: '0.8 KB',
    modified: '2025-01-11',
    content: `Dashboard Application README

This application provides a modern file management interface with the following capabilities:

1. File browsing and selection
2. Real-time file preview
3. Multiple file format support
4. Responsive design
5. Modern UI/UX

Installation:
- Clone the repository
- Install dependencies
- Run the development server

Usage:
- Click on any file in the left pane to preview
- Use search to find specific files
- Toggle between different view modes`
  }
])

const selectedFile = ref(null)
const searchQuery = ref('')
const viewMode = ref('list') // 'list' or 'grid'

// Computed properties
const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value
  return files.value.filter(file => 
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fileIcon = computed(() => (type) => {
  const icons = {
    'markdown': '📝',
    'json': '⚙️',
    'css': '🎨',
    'javascript': '⚡',
    'text': '📄',
    'image': '🖼️',
    'video': '🎥',
    'audio': '🎵'
  }
  return icons[type] || '📄'
})

// Methods
const selectFile = (file) => {
  selectedFile.value = file
}

const getFileTypeClass = (type) => {
  return `file-type-${type}`
}

const formatFileSize = (size) => {
  return size
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

const clearSelection = () => {
  selectedFile.value = null
}
</script>

<template>
  <div class="dashboard">
    <!-- File Viewer Pane -->
    <div class="file-viewer-pane">
      <div class="file-viewer-header">
        <h2>📁 File Explorer</h2>
        <div class="viewer-controls">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search files..." 
            class="search-input"
          >
          <button @click="toggleViewMode" class="view-toggle">
            {{ viewMode === 'list' ? '⊞' : '☰' }}
          </button>
        </div>
      </div>

      <div class="file-list" :class="{ 'grid-view': viewMode === 'grid' }">
        <div 
          v-for="file in filteredFiles" 
          :key="file.id"
          @click="selectFile(file)"
          class="file-item"
          :class="{ 
            'selected': selectedFile?.id === file.id,
            [getFileTypeClass(file.type)]: true
          }"
        >
          <div class="file-icon">{{ fileIcon(file.type) }}</div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-meta">
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
              <span class="file-date">{{ file.modified }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Pane -->
    <div class="preview-pane">
      <div class="preview-header">
        <h3>{{ selectedFile ? '👁️ File Preview' : '📋 Select a file to preview' }}</h3>
        <button v-if="selectedFile" @click="clearSelection" class="close-preview">✕</button>
      </div>

      <div v-if="selectedFile" class="file-details">
        <div class="file-details-grid">
          <div class="detail-item">
            <strong>Name:</strong> {{ selectedFile.name }}
          </div>
          <div class="detail-item">
            <strong>Type:</strong> {{ selectedFile.type }}
          </div>
          <div class="detail-item">
            <strong>Size:</strong> {{ selectedFile.size }}
          </div>
          <div class="detail-item">
            <strong>Modified:</strong> {{ selectedFile.modified }}
          </div>
        </div>
      </div>

      <div class="preview-content">
        <div v-if="!selectedFile" class="no-selection">
          <div class="no-selection-icon">📂</div>
          <p>Choose a file from the left panel to view its contents</p>
        </div>

        <div v-else class="file-content">
          <div class="content-header">
            <span class="content-type">{{ selectedFile.type.toUpperCase() }}</span>
          </div>
          <pre class="content-display"><code>{{ selectedFile.content }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
