<template>
  <div>
    <p>
      View email delivery statistics including open rates, click rates, and
      scroll depth tracking.
    </p>

    <b-row class="mb-3">
      <b-col md="3">
        <label>Email Type</label>
        <b-form-select v-model="emailType" :options="emailTypeOptions" />
      </b-col>
      <b-col md="3">
        <label>Start Date</label>
        <b-form-input v-model="startDate" type="date" />
      </b-col>
      <b-col md="3">
        <label>End Date</label>
        <b-form-input v-model="endDate" type="date" />
      </b-col>
      <b-col md="3" class="d-flex align-items-end">
        <b-button variant="primary" :disabled="loading" @click="fetchStats">
          <span v-if="loading">Loading...</span>
          <span v-else>Refresh</span>
        </b-button>
      </b-col>
    </b-row>

    <div v-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-if="stats" class="mt-3">
      <b-row>
        <b-col md="3">
          <div class="stat-card">
            <div class="stat-value">
              {{ stats.total_sent.toLocaleString() }}
            </div>
            <div class="stat-label">Total Sent</div>
          </div>
        </b-col>
        <b-col md="3">
          <div class="stat-card">
            <div class="stat-value">{{ stats.opened.toLocaleString() }}</div>
            <div class="stat-label">
              Opened ({{ stats.open_rate.toFixed(1) }}%)
            </div>
          </div>
        </b-col>
        <b-col md="3">
          <div class="stat-card">
            <div class="stat-value">{{ stats.clicked.toLocaleString() }}</div>
            <div class="stat-label">
              Clicked ({{ stats.click_rate.toFixed(1) }}%)
            </div>
          </div>
        </b-col>
        <b-col md="3">
          <div class="stat-card">
            <div class="stat-value">{{ stats.bounced.toLocaleString() }}</div>
            <div class="stat-label">
              Bounced ({{ stats.bounce_rate.toFixed(1) }}%)
            </div>
          </div>
        </b-col>
      </b-row>

      <b-row class="mt-3">
        <b-col md="6">
          <div class="stat-card">
            <div class="stat-value">
              {{ stats.click_to_open_rate.toFixed(1) }}%
            </div>
            <div class="stat-label">Click-to-Open Rate</div>
            <div class="stat-description">
              Of those who opened, this percentage clicked a link.
            </div>
          </div>
        </b-col>
        <b-col md="6">
          <div class="stat-card">
            <div class="stat-value text-success">
              {{ (100 - stats.bounce_rate).toFixed(1) }}%
            </div>
            <div class="stat-label">Deliverability</div>
            <div class="stat-description">
              Percentage of emails successfully delivered.
            </div>
          </div>
        </b-col>
      </b-row>

      <div v-if="period.start || period.end" class="mt-3 text-muted">
        <small>
          Period: {{ period.start || 'All time' }} to
          {{ period.end || 'Present' }}
          <span v-if="period.type"> ({{ period.type }} emails only)</span>
        </small>
      </div>
    </div>

    <div v-else-if="!loading && !error" class="text-muted mt-3">
      Click Refresh to load statistics.
    </div>
  </div>
</template>
<script>
import { useAuthStore } from '~/stores/auth'

export default {
  data() {
    return {
      loading: false,
      error: null,
      stats: null,
      period: {},
      emailType: '',
      startDate: '',
      endDate: '',
      emailTypeOptions: [
        { value: '', text: 'All Types' },
        { value: 'Digest', text: 'Digest' },
        { value: 'Chat', text: 'Chat Notifications' },
        { value: 'Alert', text: 'Alerts' },
        { value: 'Welcome', text: 'Welcome Emails' },
        { value: 'Relevant', text: 'Relevant Items' },
        { value: 'Engage', text: 'Re-engagement' },
      ],
    }
  },
  mounted() {
    this.setDefaultDates()
    this.fetchStats()
  },
  methods: {
    setDefaultDates() {
      const today = new Date()
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)

      this.endDate = today.toISOString().split('T')[0]
      this.startDate = weekAgo.toISOString().split('T')[0]
    },

    async fetchStats() {
      this.loading = true
      this.error = null

      try {
        const authStore = useAuthStore()
        const config = useRuntimeConfig()

        const params = new URLSearchParams()
        if (this.emailType) params.append('type', this.emailType)
        if (this.startDate) params.append('start', this.startDate)
        if (this.endDate) params.append('end', this.endDate)

        const url = `${config.public.APIv2}/email/stats?${params.toString()}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${authStore.jwt}`,
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Not authorised. Please log in again.')
          } else if (response.status === 403) {
            throw new Error('You need Support or Admin access to view this.')
          }
          throw new Error(`Failed to fetch stats: ${response.statusText}`)
        }

        const data = await response.json()
        this.stats = data.stats
        this.period = data.period || {}
      } catch (e) {
        console.error('Failed to fetch email stats:', e)
        this.error = e.message || 'Failed to load email statistics.'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style scoped>
.stat-card {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  padding: 1rem;
  text-align: center;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #212529;
}

.stat-label {
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 0.25rem;
}

.stat-description {
  font-size: 0.75rem;
  color: #adb5bd;
  margin-top: 0.5rem;
}
</style>
