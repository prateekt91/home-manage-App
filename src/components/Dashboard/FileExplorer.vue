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
const selectedFiles = ref(new Set()) // For multi-select
const isMultiSelectMode = ref(false)
const searchQuery = ref('')
const viewMode = ref('list') // 'list' or 'grid'

// Loading and error states
const isLoadingFiles = ref(false)
const isLoadingFileContent = ref(false)
const loadingFileId = ref(null)
const filesError = ref(null)
const fileContentError = ref(null)

// Upload state
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadError = ref(null)
const selectedFilesForUpload = ref([])

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

const selectedFileCount = computed(() => selectedFiles.value.size)

const allFilesSelected = computed(() => {
  return filteredFiles.value.length > 0 && 
         filteredFiles.value.every(file => selectedFiles.value.has(file.id || file._id))
})

const someFilesSelected = computed(() => {
  return selectedFiles.value.size > 0 && !allFilesSelected.value
})

const selectedFilesArray = computed(() => {
  return filteredFiles.value.filter(file => selectedFiles.value.has(file.id || file._id))
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
  return isMediaFile(file.type) && file.size > 100 * 1024 * 1024
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
// MULTI-SELECT METHODS
// ============================================================================

const toggleMultiSelectMode = () => {
  isMultiSelectMode.value = !isMultiSelectMode.value
  if (!isMultiSelectMode.value) {
    selectedFiles.value.clear()
  }
}

const toggleFileSelection = (file, event) => {
  event.stopPropagation()
  const fileId = file.id || file._id
  
  if (selectedFiles.value.has(fileId)) {
    selectedFiles.value.delete(fileId)
  } else {
    selectedFiles.value.add(fileId)
  }
}

const toggleSelectAll = () => {
  if (allFilesSelected.value) {
    selectedFiles.value.clear()
  } else {
    filteredFiles.value.forEach(file => {
      selectedFiles.value.add(file.id || file._id)
    })
  }
}

const clearAllSelections = () => {
  selectedFiles.value.clear()
}

const downloadSelectedFiles = async () => {
  if (selectedFiles.value.size === 0) return
  
  //TODO  Here you would implement bulk download logic
  console.log('Downloading selected files:', selectedFilesArray.value.map(f => f.name))
  alert(`Would download ${selectedFiles.value.size} files`)
}

const uploadFiles = async () => {
  if (selectedFilesForUpload.value.length === 0) {
    alert('Please select files to upload')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0
  uploadError.value = null

  try {
    const result = await apiService.uploadFiles(selectedFilesForUpload.value)

    // Show success message
    alert(`Successfully uploaded ${selectedFilesForUpload.value.length} files`)

    // Clear selected files for upload
    selectedFilesForUpload.value = []

    // Refresh the file list to show new files
    await refreshFiles()

  } catch (error) {
    uploadError.value = error.message || 'Failed to upload files'
    console.error('Error uploading files:', error)
    alert('Failed to upload files. Please try again.')
  } finally {
    isUploading.value = false
    uploadProgress.value = 0
  }
}

const handleFileSelection = (event) => {
  const files = Array.from(event.target.files)
  selectedFilesForUpload.value = files
}

const removeFileFromUpload = (index) => {
  selectedFilesForUpload.value.splice(index, 1)
}

const clearUploadSelection = () => {
  selectedFilesForUpload.value = []
}

const triggerFileInput = () => {
  const fileInput = document.getElementById('file-upload-input')
  fileInput?.click()
}

const deleteSelectedFiles = async () => {
  if (selectedFiles.value.size === 0) return
  
  const confirmed = confirm(`Are you sure you want to delete ${selectedFiles.value.size} selected files?`)
  if (!confirmed) return
  
  try {
    // Call the API to delete files
    await apiService.deleteMultipleFiles(selectedFilesArray)

    // Show a success message
    alert(`Successfully deleted ${selectedFilesArray.value.length} files`)

    // Clear selections after successful deletion
    selectedFiles.value.clear()
    
    // Refresh the file list to reflect changes
    await refreshFiles()
    
  } catch (error) {
    console.error('Error deleting files:', error)
    alert('Failed to delete files. Please try again.')
  }
}

const getSelectedFilesInfo = () => {
  const totalSize = selectedFilesArray.value.reduce((sum, file) => sum + file.size, 0)
  return {
    count: selectedFiles.value.size,
    totalSize: formatFileSize(totalSize)
  }
}

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
  },

  async deleteMultipleFiles(files) {
    let url = `${API_BASE_URL}/files/delete`
    try {
      const formData = new FormData()
      files.value.forEach(file => {
        formData.append('fileNames', file.name)
      })
      const response = await fetch(url, {
        method: 'DELETE',
        body: formData
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        // If no JSON content, return a success indicator
        return { success: true, message: 'Files deleted successfully' }
      }

    }catch (error) {
      console.error('Error deleting files:', error)
      throw error
    }
  },

  async uploadFiles(files) {
    const url = `${API_BASE_URL}/files/upload`
    try {
      const formData = new FormData()
      files.forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch(url, {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        // If no JSON content, return a success indicator
        return { success: true, message: 'Files uploaded successfully' }
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      throw error
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
  loadingFileId.value = file.id || file._id
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
    loadingFileId.value = null // Clear the loading file tracker
  }
}

const selectFile = async (file) => {
  if (isMultiSelectMode.value) return // Don't load content in multi-select mode
  
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
          :disabled="isLoadingFiles"
        >
        <button @click="toggleViewMode" class="view-toggle" :disabled="isLoadingFiles">
          {{ viewMode === 'list' ? '⊞' : '☰' }}
        </button>
        <button 
          @click="toggleMultiSelectMode" 
          class="multi-select-toggle"
          :class="{ active: isMultiSelectMode }"
          :disabled="isLoadingFiles"
        >
          {{ isMultiSelectMode ? '✓' : '☐' }}
        </button>
        <button 
          @click="triggerFileInput" 
          class="upload-btn"
          :disabled="isLoadingFiles || isUploading"
        >
          📤 Upload
        </button>
      </div>

      <!-- Hidden file input -->
      <input
        id="file-upload-input"
        type="file"
        multiple
        @change="handleFileSelection"
        style="display: none"
      >

      <!-- Upload section -->
      <div v-if="selectedFilesForUpload.length > 0" class="upload-section">
        <div class="upload-header">
          <h4>📤 Files to Upload ({{ selectedFilesForUpload.length }})</h4>
          <button @click="clearUploadSelection" class="clear-upload-btn">✕ Clear</button>
        </div>

        <div class="upload-file-list">
          <div 
            v-for="(file, index) in selectedFilesForUpload" 
            :key="index"
            class="upload-file-item"
          >
            <span class="upload-file-icon">{{ fileIcon(file.type) }}</span>
            <span class="upload-file-name">{{ file.name }}</span>
            <span class="upload-file-size">{{ formatFileSize(file.size) }}</span>
            <button 
              @click="removeFileFromUpload(index)" 
              class="remove-file-btn"
              :disabled="isUploading"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="upload-controls">
          <button 
            @click="uploadFiles" 
            class="upload-action-btn"
            :disabled="isUploading || selectedFilesForUpload.length === 0"
          >
            {{ isUploading ? 'Uploading...' : `Upload ${selectedFilesForUpload.length} files` }}
          </button>
        </div>

        <!-- Upload progress -->
        <div v-if="isUploading" class="upload-progress">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <span class="progress-text">{{ uploadProgress }}% uploaded</span>
        </div>

        <!-- Upload error -->
        <div v-if="uploadError" class="upload-error">
          <span class="error-icon">❌</span>
          <span>{{ uploadError }}</span>
        </div>
      </div>

      <!-- Multi-select controls -->
      <div v-if="isMultiSelectMode" class="multi-select-controls">
        <div class="select-all-container">
          <input
            type="checkbox"
            id="select-all"
            :checked="allFilesSelected"
            :indeterminate="someFilesSelected"
            @change="toggleSelectAll"
            class="select-all-checkbox"
          >
          <label for="select-all" class="select-all-label">
            {{ allFilesSelected ? 'Deselect All' : 'Select All' }}
          </label>
        </div>
        
        <div v-if="selectedFileCount > 0" class="selection-info">
          <span class="selected-count">{{ selectedFileCount }} selected</span>
          <span class="selected-size">({{ getSelectedFilesInfo().totalSize }})</span>
        </div>
      </div>

      <!-- Bulk actions -->
      <div v-if="isMultiSelectMode && selectedFileCount > 0" class="bulk-actions">
        <button @click="downloadSelectedFiles" class="bulk-action-btn download-btn">
          📥 Download ({{ selectedFileCount }})
        </button>
        <button @click="deleteSelectedFiles" class="bulk-action-btn delete-btn">
          🗑️ Delete ({{ selectedFileCount }})
        </button>
        <button @click="clearAllSelections" class="bulk-action-btn clear-btn">
          ✕ Clear Selection
        </button>
      </div>

      <div class="file-list" :class="{ 'grid-view': viewMode === 'grid', 'multi-select-mode': isMultiSelectMode }">
        <div
          v-for="file in filteredFiles"
          :key="file.id"
          @click="selectFile(file)"
          class="file-item"
          :class="{
            'selected': selectedFile?.id === file.id && !isMultiSelectMode,
            'multi-selected': selectedFiles.has(file.id || file._id),
            'loading': loadingFileId === (file.id || file._id),
            [getFileTypeClass(file.type)]: true
          }"
        >
          <!-- Multi-select checkbox -->
          <div v-if="isMultiSelectMode" class="file-checkbox-container">
            <input
              type="checkbox"
              :checked="selectedFiles.has(file.id || file._id)"
              @change="toggleFileSelection(file, $event)"
              class="file-checkbox"
              :id="`file-${file.id || file._id}`"
            >
          </div>

          <div class="file-icon">
            <div v-if="loadingFileId === (file.id || file._id)" class="loading-spinner"></div>
            <span v-else>{{ fileIcon(file.type) }}</span>
          </div>
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
      <div v-if="isLoadingFiles" class="loading-container">
        <div class="loading-spinner"></div>
        <p class="loading-text">Loading files...</p>
      </div>

      <!-- Error message for files -->
      <div v-if="filesError" class="error">
        {{ filesError }}
        <button @click="refreshFiles" class="retry-btn" :disabled="isLoadingFiles">
          {{ isLoadingFiles ? 'Loading...' : 'Retry' }}
        </button>
      </div>
    </div>

    <!-- Preview Pane -->
    <div class="preview-pane">
      <div class="preview-header">
        <h3>
          {{ isMultiSelectMode && selectedFileCount > 0 
              ? `📋 ${selectedFileCount} files selected` 
              : selectedFile 
                ? '👁️ File Preview' 
                : '📋 Select a file to preview' 
          }}
        </h3>
        <button v-if="selectedFile && !isMultiSelectMode" @click="clearSelection" class="close-preview">✕</button>
      </div>

      <!-- Multi-select summary -->
      <div v-if="isMultiSelectMode && selectedFileCount > 0" class="multi-select-summary">
        <div class="summary-stats">
          <div class="stat-item">
            <strong>Files:</strong> {{ selectedFileCount }}
          </div>
          <div class="stat-item">
            <strong>Total Size:</strong> {{ getSelectedFilesInfo().totalSize }}
          </div>
        </div>
        
        <div class="selected-files-list">
          <h4>Selected Files:</h4>
          <div class="selected-files-grid">
            <div 
              v-for="file in selectedFilesArray.slice(0, 10)" 
              :key="file.id"
              class="selected-file-item"
            >
              <span class="file-icon-small">{{ fileIcon(file.type) }}</span>
              <span class="file-name-small">{{ file.name }}</span>
              <span class="file-size-small">{{ formatFileSize(file.size) }}</span>
            </div>
            <div v-if="selectedFileCount > 10" class="more-files">
              +{{ selectedFileCount - 10 }} more files...
            </div>
          </div>
        </div>
      </div>

      <!-- Single file details and preview (existing code) -->
      <div v-else>
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
            <p v-if="isMultiSelectMode" class="multi-select-hint">
              💡 Multi-select is active. Toggle it off to preview individual files.
            </p>
          </div>

          <!-- Loading State -->
          <div v-else-if="isLoadingFileContent" class="loading-container">
            <div class="loading-spinner large"></div>
            <p class="loading-text">Loading file content...</p>
            <p class="loading-subtext">{{ selectedFile.name }}</p>
          </div>

          <!-- Error State -->
          <div v-else-if="fileContentError" class="error">
            <div class="error-icon">❌</div>
            <p>{{ fileContentError }}</p>
            <button @click="loadFileContent(selectedFile)" class="retry-btn" :disabled="isLoadingFileContent">
              {{ isLoadingFileContent ? 'Loading...' : 'Retry' }}
            </button>
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
                  {{ isFullscreenPdf ? '↙️' : '⤢' }} {{ isFullscreenPdf ? 'Exit Maximize' : 'Maximize' }}
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