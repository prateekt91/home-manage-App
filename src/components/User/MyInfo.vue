<script setup>
import { ref } from 'vue'
import './MyInfo.css'

var user = {
  "name": "Prateek",
  "email": "prateek@example.com",
  "phone": "+1 (555) 123-4567",
  "location": "San Francisco, CA",
  "role": "Software Engineer",
  "department": "Engineering",
  "joinDate": "January 15, 2023",
  "employeeId": "EMP-2023-001",
  "manager": "Sarah Johnson",
  "status": "Active",
  "avatar": "https://ui-avatars.com/api/?name=Prateek&background=667eea&color=fff&size=120"
}
</script>

<template>
  <div class="dashboard">
    <div class="user-details-pane">
      <div class="user-details-header">
        <h2>User Profile</h2>
      </div>
      <div class="user-profile-card">
        <div class="avatar-section">
          <img :src="user.avatar" :alt="user.name" class="user-avatar" />
          <div class="user-basic-info">
            <h3 class="user-name">{{ user.name }}</h3>
            <p class="user-role">{{ user.role }}</p>
            <span class="status-badge" :class="user.status.toLowerCase()">{{ user.status }}</span>
          </div>
        </div>
        <div class="quick-stats">
          <div class="stat-item">
            <span class="stat-label">Employee ID</span>
            <span class="stat-value">{{ user.employeeId }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Department</span>
            <span class="stat-value">{{ user.department }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Join Date</span>
            <span class="stat-value">{{ user.joinDate }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="user-information-pane">
      <div class="user-information-header">
        <h3>Contact Information</h3>
      </div>
      <div class="info-grid">
        <div class="info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Email Address</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Phone Number</span>
            <span class="info-value">{{ user.phone }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Location</span>
            <span class="info-value">{{ user.location }}</span>
          </div>
        </div>

        <div class="info-card">
          <div class="info-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="info-content">
            <span class="info-label">Manager</span>
            <span class="info-value">{{ user.manager }}</span>
          </div>
        </div>
      </div>

      <div class="additional-info">
        <h4>Hobbies</h4>
        <div class="detail-row">
<!--          <span class="detail-label">Position:</span>-->
          <span class="detail-value">{{ user.hobbies }}</span>
        </div>
      </div>
    </div>
  </div>
</template>