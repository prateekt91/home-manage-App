<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import './FileExplorer.css'

// ============================================================================
// CONFIGURATION
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// ============================================================================
// REACTIVE STATE
// ============================================================================

// Core state
const files = ref([])
const selectedFile = ref(null)
const searchQuery = ref('')
const viewMode = ref('list') // 'list' or 'grid'

// Loading and error states
const isLoadingFiles = ref(false)
const isLoadingFileContent = ref(false)
const filesError = ref(null)
const fileContentError = ref(null)

// Media-specific state
const videoDimensions = ref({ width: 0, height: 0 })
const pdfDimensions = ref({ width: 0, height: 0 })
const isFullscreenPdf = ref(false)

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

const filteredFiles = computed(() => {
  if (!searchQuery.value) return files.value
  return files.value.filter(file =>
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const fileIcon = computed(() => (type) => {
  const icons = {
    'image/jpeg': '🖼️',
    'image/png': '🖼️',
    'image/gif': '🖼️',
    'image/webp': '🖼️',
    'application/pdf': '📄',
    'text/plain': '📝',
    'application/json': '⚙️',
    'text/css': '🎨',
    'application/javascript': '⚡',
    'text/javascript': '⚡',
    'video/mp4': '🎥',
    'audio/mp3': '🎵',
    'audio/wav': '🎵'
  }
  return icons[type] || '📄'
})

const videoPlayerStyle = computed(() => {
  if (!videoDimensions.value.width || !videoDimensions.value.height) {
    return { maxWidth: '480px', height: '360px' }
  }

  const containerWidth = 480
  const containerHeight = 360
  const videoAspectRatio = videoDimensions.value.width / videoDimensions.value.height
  const containerAspectRatio = containerWidth / containerHeight

  let width, height

  if (videoAspectRatio > containerAspectRatio) {
    width = Math.min(videoDimensions.value.width, containerWidth)
    height = width / videoAspectRatio
  } else {
    height = Math.min(videoDimensions.value.height, containerHeight)
    width = height * videoAspectRatio
  }

  return {
    width: `${width}px`,
    height: `${height}px`,
    maxWidth: '100%',
    maxHeight: '100vh'
  }
})

const pdfViewerStyle = computed(() => {
  if (isFullscreenPdf.value) {
    return {
      width: '95vw',
      height: '95vh'
    }
  }

  const containerWidth = 1200
  const containerHeight = window.innerHeight * 0.8

  return {
    width: '100%',
    height: `${Math.min(containerHeight, 800)}px`,
    maxWidth: `${containerWidth}px`
  }
})

// ============================================================================
// FILE TYPE UTILITIES
// ============================================================================

const isImageFile = (type) => type.startsWith('image/')

const isTextFile = (type) => {
  return type.startsWith('text/') ||
    type === 'application/json' ||
    type === 'application/javascript' ||
    type === 'application/xml'
}

const isMediaFile = (type) => type.startsWith('video/') || type.startsWith('audio/')

const isPDF = (type) => type.startsWith('application/pdf')

const isLargeVideoFile = (file) => {
  return isMediaFile(file.type) && file.size > 100 * 1024 * 1024 // 100MB threshold
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getFileTypeClass = (type) => `file-type-${type.replace('/', '-')}`

// ============================================================================
// API SERVICE
// ============================================================================

const apiService = {
  async fetchFiles() {
    try {
      const response = await fetch(`${API_BASE_URL}/files/list`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching files:', error)
      throw error
    }
  },

  async fetchFileContent(fileName, fileType, fileSize) {
    try {
      let url
      if (isImageFile(fileType)) {
        url = `${import.meta.env.VITE_API_URL}/files/download/resize?fileName=${encodeURIComponent(fileName)}&width=800&height=600&quality=ULTRA_QUALITY`
      } else {
        url = `${import.meta.env.VITE_API_URL}/files/download?fileName=${encodeURIComponent(fileName)}`
      }

      // For large video files, return streaming URL instead of blob
      if (isMediaFile(fileType) && fileSize > 100 * 1024 * 1024) {
        return {
          type: 'media',
          content: url,
          isStreaming: true
        }
      }

      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await this.processFileResponse(response, fileType)
    } catch (error) {
      console.error('Error fetching file content:', error)
      throw error
    }
  },

  async processFileResponse(response, fileType) {
    if (isImageFile(fileType)) {
      const blob = await response.blob()
      return {
        type: 'image',
        content: URL.createObjectURL(blob),
        blob: blob
      }
    } else if (isTextFile(fileType)) {
      const text = await response.text()
      return {
        type: 'text',
        content: text
      }
    } else if (isMediaFile(fileType)) {
      const blob = await response.blob()
      return {
        type: 'media',
        content: URL.createObjectURL(blob),
        blob: blob
      }
    } else if (isPDF(fileType)) {
      const pdf = await response.blob()
      return {
        type: 'pdf',
        content: URL.createObjectURL(pdf),
        blob: pdf
      }
    } else {
      try {
        const data = await response.json()
        return {
          type: 'json',
          content: JSON.stringify(data, null, 2)
        }
      } catch {
        const text = await response.text()
        return {
          type: 'text',
          content: text
        }
      }
    }
  }
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

const handleVideoLoadedMetadata = (event) => {
  const video = event.target
  videoDimensions.value = {
    width: video.videoWidth,
    height: video.videoHeight
  }
}

const handlePdfLoad = (event) => {
  console.log('PDF loaded')
}

const handleImageError = (event) => {
  console.error('Image failed to load:', event)
}

// ============================================================================
// CORE METHODS
// ============================================================================

const loadFiles = async () => {
  isLoadingFiles.value = true
  filesError.value = null

  try {
    const response = await apiService.fetchFiles()
    files.value = response
  } catch (error) {
    filesError.value = error.message || 'Failed to load files'
    console.error('Error loading files:', error)
  } finally {
    isLoadingFiles.value = false
  }
}

const loadFileContent = async (file) => {
  if (!file._id) return

  isLoadingFileContent.value = true
  fileContentError.value = null

  try {
    const response = await apiService.fetchFileContent(file.name, file.type, file.size)
    const updatedFile = {
      ...file,
      content: response.content,
      contentType: response.type,
      blob: response.blob,
      isStreaming: response.isStreaming
    }
    selectedFile.value = updatedFile
  } catch (error) {
    fileContentError.value = error.message || 'Failed to load file content'
    selectedFile.value = {
      ...file,
      content: 'Error loading file content',
      contentType: 'error'
    }
    console.error('Error loading file content:', error)
  } finally {
    isLoadingFileContent.value = false
  }
}

const selectFile = async (file) => {
  if (file.content) {
    selectedFile.value = file
    return
  }
  await loadFileContent(file)
}

const refreshFiles = async () => {
  await loadFiles()
  if (selectedFile.value && !files.value.find(f => f._id === selectedFile.value._id)) {
    selectedFile.value = null
  }
}

// ============================================================================
// UI INTERACTION METHODS
// ============================================================================

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

const togglePdfFullscreen = () => {
  isFullscreenPdf.value = !isFullscreenPdf.value
}

const clearSelection = () => {
  if (selectedFile.value?.blob) {
    URL.revokeObjectURL(selectedFile.value.content)
  }
  selectedFile.value = null
}

const getVideoPoster = (file) => {
  return null
  // Or if you have a thumbnail generation endpoint:
  // return `${API_BASE_URL}/files/thumbnail?fileName=${encodeURIComponent(file.name)}`
}

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

onMounted(async () => {
  await loadFiles()
})

onBeforeUnmount(() => {
  if (selectedFile.value?.blob) {
    URL.revokeObjectURL(selectedFile.value.content)
  }
})
</script>

<template>
  <div class="dashboard">
    <!-- File Viewer Pane -->
    <div class="file-viewer-pane">
      <div class="file-viewer-header">
        <h2>📁 File Explorer</h2>
      </div>
      
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

      <!-- Loading indicator for files -->
      <div v-if="isLoadingFiles" class="loading">
        Loading files...
      </div>

      <!-- Error message for files -->
      <div v-if="filesError" class="error">
        {{ filesError }}
        <button @click="refreshFiles" class="retry-btn">Retry</button>
      </div>
    </div>

    <!-- Preview Pane -->
    <div class="preview-pane">
      <div class="preview-header">
        <h3>{{ selectedFile ? '👁️ File Preview' : '📋 Select a file to preview' }}</h3>
        <button v-if="selectedFile" @click="clearSelection" class="close-preview">✕</button>
      </div>

      <!-- File Details -->
      <div v-if="selectedFile" class="file-details">
        <div class="file-details-grid">
          <div class="detail-item">
            <strong>Name:</strong> <span>{{ selectedFile.name }}</span>
          </div>
          <div class="detail-item">
            <strong>Type:</strong> <span>{{ selectedFile.type }}</span>
          </div>
          <div class="detail-item">
            <strong>Size:</strong> <span>{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <div class="detail-item">
            <strong>Modified:</strong> <span>{{ selectedFile.modified }}</span>
          </div>
        </div>
      </div>

      <!-- Preview Content -->
      <div class="preview-content">
        <!-- No Selection State -->
        <div v-if="!selectedFile" class="no-selection">
          <div class="no-selection-icon">📂</div>
          <p>Choose a file from the left panel to view its contents</p>
        </div>

        <!-- Loading State -->
        <div v-else-if="isLoadingFileContent" class="loading">
          <div class="loading-spinner">⏳</div>
          <p>Loading file content...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="fileContentError" class="error">
          <div class="error-icon">❌</div>
          <p>{{ fileContentError }}</p>
          <button @click="loadFileContent(selectedFile)" class="retry-btn">Retry</button>
        </div>

        <!-- File Content Display -->
        <div v-else class="file-content">
          <div class="content-header">
            <span class="content-type">{{ selectedFile.type.toUpperCase() }}</span>
          </div>

          <!-- Image Content -->
          <div v-if="selectedFile.contentType === 'image'" class="image-content">
            <img
              :src="selectedFile.content"
              :alt="selectedFile.name"
              class="preview-image"
              @error="handleImageError"
            />
          </div>

          <!-- Media Content -->
          <div v-else-if="selectedFile.contentType === 'media'" class="media-content">
            <video
              controls
              preload="metadata"
              controlslist="nodownload"
              class="video-player"
              :style="videoPlayerStyle"
              :poster="getVideoPoster(selectedFile)"
              @loadedmetadata="handleVideoLoadedMetadata"
            >
              <source :src="selectedFile.content" :type="selectedFile.type">
              <p>Your browser doesn't support HTML5 video. Here is a <a :href="selectedFile.content">link to the video</a> instead.</p>
            </video>
            <div class="video-info">
              <span class="video-name">{{ selectedFile.name }}</span>
              <span class="video-type">{{ selectedFile.type }}</span>
              <span v-if="videoDimensions.width && videoDimensions.height" class="video-dimensions">
                {{ videoDimensions.width }}×{{ videoDimensions.height }}
              </span>
            </div>
          </div>

          <!-- PDF Content -->
          <div v-else-if="selectedFile.contentType === 'pdf'" class="pdf-content">
            <div class="pdf-controls">
              <button @click="togglePdfFullscreen" class="pdf-fullscreen-btn">
                {{ isFullscreenPdf ? '↙️' : '⤢' }} {{ isFullscreenPdf ? 'Exit Fullscreen' : 'Fullscreen' }}
              </button>
            </div>
            
            <iframe 
              :src="selectedFile.content" 
              class="pdf-viewer"
              :style="pdfViewerStyle"
              @load="handlePdfLoad"
              title="PDF Viewer"
            ></iframe>
            
            <div class="pdf-info">
              <span class="pdf-name">{{ selectedFile.name }}</span>
              <span class="pdf-type">{{ selectedFile.type }}</span>
            </div>
          </div>

          <!-- Text/JSON Content -->
          <div v-else-if="selectedFile.contentType === 'text' || selectedFile.contentType === 'json'" class="text-content">
            <pre class="content-display"><code>{{ selectedFile.content }}</code></pre>
          </div>

          <!-- Unknown Content Type -->
          <div v-else class="unknown-content">
            <div class="unknown-icon">❓</div>
            <p>Cannot preview this file type</p>
            <p class="file-info">{{ selectedFile.type }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF Fullscreen Modal -->
    <div v-if="isFullscreenPdf" class="pdf-fullscreen" @click.self="togglePdfFullscreen">
      <button @click="togglePdfFullscreen" class="pdf-fullscreen-close">✕</button>
      <iframe 
        :src="selectedFile.content" 
        class="pdf-viewer"
        :style="pdfViewerStyle"
        title="PDF Viewer Fullscreen"
      ></iframe>
    </div>
  </div>
</template>