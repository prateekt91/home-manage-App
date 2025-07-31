<script setup>
import { ref } from 'vue'
import './UserManager.css'

var user = {"name":"Prateek"}
</script>

<template>
  <div class="dashboard">
    <div class="user-details-pane">
      <div class="user-details-header">
        <h2>User Details</h2>
      </div>
    </div>
    <div class="user-information-pane">
      <div class="user-information-header">
        <h3>{{user.name}}</h3>
      </div>
    </div>
  </div>
</template>