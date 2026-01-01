<template>
  <div class="email-stats-container">
    <NoticeMessage variant="info" class="mb-3">
      <p class="mb-0">
        <strong>Email tracking statistics.</strong> Filter by date range and
        email type to see aggregate metrics.
        <b-button
          variant="link"
          size="sm"
          class="p-0 ml-1"
          @click="showInfoModal = true"
        >
          How does tracking work?
        </b-button>
      </p>
    </NoticeMessage>

    <!-- Info Modal -->
    <b-modal
      v-model="showInfoModal"
      title="How Email Tracking Works"
      ok-only
      ok-title="Got it"
      size="lg"
    >
      <h6>How We Track Emails</h6>
      <p>When we send an email, we include two tracking mechanisms:</p>
      <ul>
        <li>
          <strong>Tracking pixel:</strong> A tiny invisible image embedded in
          the email. When your email client loads images, it requests this pixel
          from our server, and we record that the email was opened.
        </li>
        <li>
          <strong>Link wrapping:</strong> All links in the email are wrapped
          through our tracking system. When you click a link, it passes through
          our server (which records the click) before redirecting you to the
          actual destination.
        </li>
      </ul>

      <h6 class="mt-4">Why Open Rates Are Underestimated</h6>
      <p>
        Many email clients and services block tracking pixels by default for
        privacy reasons:
      </p>
      <ul>
        <li>Apple Mail's "Protect Mail Activity" feature blocks tracking</li>
        <li>Gmail sometimes pre-fetches images through proxy servers</li>
        <li>Outlook and other clients may block external images</li>
        <li>Privacy-focused email clients block all tracking</li>
      </ul>
      <p>
        This means someone can read your email without us knowing - we only
        detect opens when the tracking pixel loads successfully.
      </p>

      <h6 class="mt-4">Why Click-to-Open Rate Can Exceed 100%</h6>
      <p>
        The Click-to-Open Rate shows what percentage of people who opened an
        email then clicked a link. But because we miss many opens (due to
        blocked tracking pixels), we can have this situation:
      </p>
      <ul>
        <li>We send 100 emails</li>
        <li>50 people actually open the email</li>
        <li>We only detect 20 opens (tracking blocked for 30)</li>
        <li>25 people click a link</li>
        <li>Click-to-Open Rate = 25/20 = 125% (appears to exceed 100%)</li>
      </ul>

      <h6 class="mt-4">Which Metrics Are Reliable?</h6>
      <div class="d-flex align-items-center mb-2">
        <span class="reliability-badge reliable mr-2">Reliable</span>
        <strong>Click Rate, Bounce Rate</strong>
      </div>
      <p class="small text-muted mb-3">
        These metrics don't depend on tracking pixels and accurately reflect
        actual behaviour.
      </p>

      <div class="d-flex align-items-center mb-2">
        <span class="reliability-badge unreliable mr-2">Underestimated</span>
        <strong>Open Rate, Click-to-Open Rate</strong>
      </div>
      <p class="small text-muted">
        These metrics will always show lower than reality due to tracking being
        blocked. Use them for relative comparisons (e.g., comparing email types)
        rather than absolute values.
      </p>
    </b-modal>

    <!-- Date Range Filter -->
    <b-card class="mb-3 filter-card">
      <b-form class="filter-form" inline @submit.prevent="fetchStats">
        <label class="filter-label">From:</label>
        <b-form-input
          v-model="startDate"
          type="date"
          size="sm"
          style="width: 125px"
        />
        <label class="filter-label">To:</label>
        <b-form-input
          v-model="endDate"
          type="date"
          size="sm"
          style="width: 125px"
        />
        <label class="filter-label">Type:</label>
        <b-form-select
          v-model="emailType"
          :options="emailTypeOptions"
          size="sm"
          style="width: 110px"
        />
        <b-button
          type="submit"
          variant="primary"
          size="sm"
          :disabled="emailTrackingStore.statsLoading"
        >
          <span v-if="emailTrackingStore.statsLoading">
            <b-spinner small class="mr-1" />
            Loading...
          </span>
          <span v-else>Fetch Stats</span>
        </b-button>
      </b-form>
    </b-card>

    <!-- Error Message -->
    <NoticeMessage
      v-if="emailTrackingStore.statsError"
      variant="danger"
      class="mb-3"
    >
      {{ emailTrackingStore.statsError }}
    </NoticeMessage>

    <!-- Statistics Cards -->
    <div v-if="emailTrackingStore.hasStats" class="mb-4 stats-flex">
      <div class="stat-card stat-card--reliable">
        <div class="stat-value text-primary">
          {{ formattedStats.totalSent.toLocaleString() }}
        </div>
        <div class="stat-label">Sent</div>
      </div>
      <div class="stat-card stat-card--unreliable">
        <div class="stat-value text-success">
          {{ formattedStats.openRate }}%
        </div>
        <div class="stat-label">
          Opens
          <small class="text-muted d-block">
            {{ formattedStats.opened.toLocaleString() }}
          </small>
        </div>
      </div>
      <div class="stat-card stat-card--reliable">
        <div class="stat-value text-info">{{ formattedStats.clickRate }}%</div>
        <div class="stat-label">
          Clicks
          <small class="text-muted d-block">
            {{ formattedStats.clicked.toLocaleString() }}
          </small>
        </div>
      </div>
      <div class="stat-card stat-card--reliable">
        <div class="stat-value text-danger">
          {{ formattedStats.bounceRate }}%
        </div>
        <div class="stat-label">
          Bounces
          <small class="text-muted d-block">
            {{ formattedStats.bounced.toLocaleString() }}
          </small>
        </div>
      </div>
      <div class="stat-card stat-card--unreliable">
        <div class="stat-value text-warning">
          {{ formattedStats.clickToOpenRate }}%
        </div>
        <div class="stat-label">
          Clicked
          <small class="text-muted d-block"> once opened </small>
        </div>
      </div>
    </div>

    <!-- No Stats Message -->
    <div
      v-else-if="
        !emailTrackingStore.statsLoading && !emailTrackingStore.statsError
      "
      class="text-muted text-center py-4"
    >
      <p>No email tracking data available for the selected period.</p>
      <p class="small">Try adjusting the date range or email type filter.</p>
    </div>

    <!-- Charts Section -->
    <div v-if="emailTrackingStore.hasStats" class="charts-section mt-4">
      <h5 class="mb-3">Engagement Analysis</h5>
      <p class="text-muted small mb-3">
        These charts show email engagement rates - how well our emails perform.
        Click Rate and Bounce Rate are reliable metrics. Higher click rates and
        lower bounce rates indicate better email quality.
      </p>

      <div class="charts-grid">
        <!-- Engagement Over Time Chart -->
        <div class="chart-container">
          <div
            v-if="emailTrackingStore.timeSeriesLoading"
            class="chart-loading"
          >
            <b-spinner small class="mr-2" />
            Loading chart data...
          </div>
          <div
            v-else-if="emailTrackingStore.timeSeriesError"
            class="chart-error text-danger"
          >
            {{ emailTrackingStore.timeSeriesError }}
          </div>
          <GChart
            v-else-if="emailTrackingStore.hasTimeSeries"
            type="LineChart"
            :data="emailTrackingStore.timeSeriesChartData"
            :options="getEngagementChartOptions()"
            class="chart"
          />
          <div v-else class="chart-empty text-muted">
            No time series data available.
          </div>
        </div>

        <!-- Email Type Comparison Chart -->
        <div class="chart-container">
          <div
            v-if="emailTrackingStore.statsByTypeLoading"
            class="chart-loading"
          >
            <b-spinner small class="mr-2" />
            Loading chart data...
          </div>
          <div
            v-else-if="emailTrackingStore.statsByTypeError"
            class="chart-error text-danger"
          >
            {{ emailTrackingStore.statsByTypeError }}
          </div>
          <GChart
            v-else-if="emailTrackingStore.hasStatsByType"
            type="ColumnChart"
            :data="emailTrackingStore.typeComparisonChartData"
            :options="getTypeComparisonOptions()"
            class="chart"
          />
          <div v-else class="chart-empty text-muted">
            No email type data available.
          </div>
        </div>
      </div>

      <!-- Volume Chart (secondary, collapsible) -->
      <div class="mt-4">
        <b-button
          v-b-toggle.volume-chart
          variant="link"
          size="sm"
          class="p-0 text-muted"
        >
          <span class="when-open">Hide</span>
          <span class="when-closed">Show</span>
          email volume chart
        </b-button>
        <b-collapse id="volume-chart" class="mt-2">
          <div class="chart-container chart-container--small">
            <GChart
              v-if="emailTrackingStore.hasTimeSeries"
              type="AreaChart"
              :data="emailTrackingStore.volumeChartData"
              :options="getVolumeChartOptions()"
              class="chart"
            />
            <div v-else class="chart-empty text-muted">
              No volume data available.
            </div>
          </div>
          <p class="text-muted small mt-2">
            This shows the raw number of emails sent. This is driven by external
            user activity rather than email quality.
          </p>
        </b-collapse>
      </div>

      <!-- Top Clicked Links Section -->
      <div class="mt-4">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="mb-0">Most Clicked Links</h6>
          <b-form-checkbox
            :checked="emailTrackingStore.aggregateClickedLinks"
            switch
            size="sm"
            @change="emailTrackingStore.toggleAggregateClickedLinks()"
          >
            Group similar URLs
          </b-form-checkbox>
        </div>
        <p class="text-muted small mb-2">
          <span v-if="emailTrackingStore.aggregateClickedLinks">
            Similar URLs are grouped together (e.g., /message/123 and
            /message/456 are aggregated).
          </span>
          <span v-else> Showing individual URLs with click counts. </span>
        </p>

        <div
          v-if="emailTrackingStore.clickedLinksLoading"
          class="text-center py-3"
        >
          <b-spinner small class="mr-2" />
          Loading clicked links...
        </div>
        <div
          v-else-if="emailTrackingStore.clickedLinksError"
          class="text-danger"
        >
          {{ emailTrackingStore.clickedLinksError }}
        </div>
        <div v-else-if="emailTrackingStore.hasClickedLinks">
          <b-table
            :items="emailTrackingStore.clickedLinks"
            :fields="clickedLinksFieldsComputed"
            striped
            hover
            responsive
            small
            class="clicked-links-table"
          >
            <template #cell(normalized_url)="data">
              <code class="small">{{ data.value }}</code>
            </template>
            <template #cell(url)="data">
              <code
                class="small text-truncate d-block"
                style="max-width: 400px"
                :title="data.value"
                >{{ data.value }}</code
              >
            </template>
            <template #cell(click_count)="data">
              <b-badge variant="info">{{ data.value }}</b-badge>
            </template>
            <template #cell(example_urls)="data">
              <div v-if="data.value && data.value.length > 0">
                <div
                  v-for="(url, idx) in data.value.slice(0, 2)"
                  :key="idx"
                  class="small text-muted text-truncate"
                  style="max-width: 300px"
                  :title="url"
                >
                  {{ url }}
                </div>
                <span v-if="data.value.length > 2" class="small text-muted">
                  +{{ data.value.length - 2 }} more
                </span>
              </div>
            </template>
          </b-table>

          <div class="d-flex align-items-center gap-2">
            <b-button
              v-if="emailTrackingStore.hasMoreClickedLinks"
              variant="outline-primary"
              size="sm"
              @click="emailTrackingStore.toggleShowAllClickedLinks()"
            >
              Show all {{ emailTrackingStore.clickedLinksTotal }} links
            </b-button>
            <b-button
              v-else-if="
                emailTrackingStore.showAllClickedLinks &&
                emailTrackingStore.clickedLinksTotal > 5
              "
              variant="outline-secondary"
              size="sm"
              @click="emailTrackingStore.toggleShowAllClickedLinks()"
            >
              Show top 5 only
            </b-button>
            <span class="text-muted small">
              Showing {{ emailTrackingStore.clickedLinks.length }} of
              {{ emailTrackingStore.clickedLinksTotal }}
              {{
                emailTrackingStore.aggregateClickedLinks
                  ? 'link patterns'
                  : 'links'
              }}.
            </span>
          </div>
        </div>
        <div v-else class="text-muted">No clicked links data available.</div>
      </div>
    </div>

    <!-- User Email History Section -->
    <hr class="my-4" />
    <h5>User Email History</h5>
    <p class="text-muted small">
      Enter a user ID or email address to view their email history and
      engagement metrics.
    </p>

    <b-form class="user-form mb-3" @submit.prevent="fetchUserEmails">
      <label class="filter-label mr-2">User:</label>
      <b-form-input
        v-model="userIdOrEmail"
        type="text"
        size="sm"
        placeholder="ID or email"
        style="width: 200px"
        class="mr-2"
      />
      <b-button
        type="submit"
        variant="primary"
        size="sm"
        :disabled="!userIdOrEmail || emailTrackingStore.userEmailsLoading"
      >
        <span v-if="emailTrackingStore.userEmailsLoading">
          <b-spinner small class="mr-1" />
          Loading...
        </span>
        <span v-else>Load History</span>
      </b-button>
    </b-form>

    <!-- User Emails Error -->
    <NoticeMessage
      v-if="emailTrackingStore.userEmailsError"
      variant="danger"
      class="mb-3"
    >
      {{ emailTrackingStore.userEmailsError }}
    </NoticeMessage>

    <!-- User Emails Table -->
    <div v-if="emailTrackingStore.hasUserEmails">
      <p class="text-muted small mb-2">
        Showing {{ emailTrackingStore.userEmails.length }} of
        {{ emailTrackingStore.userEmailsTotal }} emails for
        <span v-if="emailTrackingStore.currentUserId">
          user #{{ emailTrackingStore.currentUserId }}
        </span>
        <span v-else-if="emailTrackingStore.currentEmail">
          {{ emailTrackingStore.currentEmail }}
        </span>
      </p>
      <b-table
        :items="emailTrackingStore.userEmails"
        :fields="emailFields"
        striped
        hover
        responsive
        small
      >
        <template #cell(sent_at)="data">
          {{ formatDate(data.value) }}
        </template>
        <template #cell(opened_at)="data">
          <span v-if="data.value" class="text-success">
            {{ formatDate(data.value) }}
            <small v-if="data.item.opened_via" class="text-muted">
              ({{ data.item.opened_via }})
            </small>
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell(clicked_at)="data">
          <span v-if="data.value" class="text-info">
            {{ formatDate(data.value) }}
            <b-badge variant="info" class="ml-1">
              {{ data.item.links_clicked }} clicks
            </b-badge>
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell(bounced_at)="data">
          <span v-if="data.value" class="text-danger">
            {{ formatDate(data.value) }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>
        <template #cell(unsubscribed_at)="data">
          <span v-if="data.value" class="text-warning">
            {{ formatDate(data.value) }}
          </span>
          <span v-else class="text-muted">-</span>
        </template>
      </b-table>

      <b-button
        v-if="emailTrackingStore.hasMoreUserEmails"
        variant="outline-primary"
        size="sm"
        :disabled="emailTrackingStore.userEmailsLoading"
        @click="loadMoreUserEmails"
      >
        <span v-if="emailTrackingStore.userEmailsLoading">
          <b-spinner small class="mr-1" />
          Loading...
        </span>
        <span v-else>Load More</span>
      </b-button>
    </div>
  </div>
</template>
<script>
import { GChart } from 'vue-google-charts'
import { useEmailTrackingStore } from '~/modtools/stores/emailtracking'
import { useRuntimeConfig } from '#app'

export default {
  name: 'ModSupportEmailStats',
  components: {
    GChart,
  },
  setup() {
    const emailTrackingStore = useEmailTrackingStore()
    const runtimeConfig = useRuntimeConfig()
    emailTrackingStore.init(runtimeConfig)
    return { emailTrackingStore }
  },
  data() {
    // Default to last 30 days.
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    return {
      showInfoModal: false,
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      emailType: '',
      userIdOrEmail: '',
      emailTypeOptions: [
        { text: 'All Types', value: '' },
        { text: 'Welcome', value: 'welcome' },
        { text: 'Digest', value: 'digest' },
        { text: 'Notification', value: 'notification' },
        { text: 'Chat', value: 'chat' },
        { text: 'Newsletter', value: 'newsletter' },
      ],
      emailFields: [
        { key: 'email_type', label: 'Type', sortable: true },
        { key: 'subject', label: 'Subject', sortable: false },
        { key: 'sent_at', label: 'Sent', sortable: true },
        { key: 'opened_at', label: 'Opened', sortable: true },
        { key: 'clicked_at', label: 'Clicked', sortable: true },
        { key: 'bounced_at', label: 'Bounced', sortable: true },
        { key: 'unsubscribed_at', label: 'Unsubscribed', sortable: true },
      ],
    }
  },
  computed: {
    formattedStats() {
      const stats = this.emailTrackingStore.formattedStats
      if (!stats) return null

      return {
        totalSent: parseInt(stats.totalSent) || 0,
        opened: parseInt(stats.opened) || 0,
        clicked: parseInt(stats.clicked) || 0,
        bounced: parseInt(stats.bounced) || 0,
        openRate: stats.openRate,
        clickRate: stats.clickRate,
        clickToOpenRate: stats.clickToOpenRate,
        bounceRate: stats.bounceRate,
      }
    },
    clickedLinksFieldsComputed() {
      if (this.emailTrackingStore.aggregateClickedLinks) {
        return [
          { key: 'normalized_url', label: 'Link Pattern', sortable: false },
          { key: 'click_count', label: 'Clicks', sortable: true },
          { key: 'example_urls', label: 'Example URLs', sortable: false },
        ]
      } else {
        return [
          { key: 'url', label: 'URL', sortable: false },
          { key: 'click_count', label: 'Clicks', sortable: true },
        ]
      }
    },
  },
  mounted() {
    // Auto-fetch stats when the component is displayed.
    this.fetchStats()
  },
  methods: {
    async fetchStats() {
      this.emailTrackingStore.setFilters({
        type: this.emailType,
        start: this.startDate,
        end: this.endDate,
      })
      // Fetch all data in parallel.
      await Promise.all([
        this.emailTrackingStore.fetchStats(),
        this.emailTrackingStore.fetchTimeSeries(),
        this.emailTrackingStore.fetchStatsByType(),
        this.emailTrackingStore.fetchClickedLinks(),
      ])
    },

    async fetchUserEmails() {
      if (!this.userIdOrEmail) return
      const input = this.userIdOrEmail.trim()
      // If it looks like an email, pass as string; otherwise parse as int.
      if (input.includes('@')) {
        await this.emailTrackingStore.fetchUserEmails(input)
      } else {
        await this.emailTrackingStore.fetchUserEmails(parseInt(input))
      }
    },

    async loadMoreUserEmails() {
      await this.emailTrackingStore.loadMoreUserEmails()
    },

    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    // Chart options for Google Charts.
    getEngagementChartOptions() {
      return {
        title: 'Engagement Rates Over Time',
        curveType: 'function',
        legend: { position: 'bottom' },
        chartArea: { width: '85%', height: '70%' },
        vAxis: {
          title: 'Rate (%)',
          viewWindow: { min: 0 },
          format: '#.#',
        },
        hAxis: {
          title: 'Date',
          format: 'dd MMM',
        },
        series: {
          0: { color: '#17a2b8' }, // Click rate - blue
          1: { color: '#dc3545' }, // Bounce rate - red
        },
        animation: {
          startup: true,
          duration: 500,
          easing: 'out',
        },
      }
    },

    getTypeComparisonOptions() {
      return {
        title: 'Engagement by Email Type',
        legend: { position: 'bottom' },
        chartArea: { width: '85%', height: '65%' },
        vAxis: {
          title: 'Rate (%)',
          viewWindow: { min: 0 },
          format: '#.#',
        },
        hAxis: {
          title: 'Email Type',
        },
        series: {
          0: { color: '#17a2b8' }, // Click rate - blue
          1: { color: '#dc3545' }, // Bounce rate - red
        },
        bar: { groupWidth: '70%' },
        animation: {
          startup: true,
          duration: 500,
          easing: 'out',
        },
      }
    },

    getVolumeChartOptions() {
      return {
        title: 'Email Volume Over Time',
        curveType: 'function',
        legend: { position: 'none' },
        chartArea: { width: '85%', height: '70%' },
        vAxis: {
          title: 'Emails Sent',
          viewWindow: { min: 0 },
        },
        hAxis: {
          title: 'Date',
          format: 'dd MMM',
        },
        series: {
          0: { color: '#28a745' }, // Green
        },
        animation: {
          startup: true,
          duration: 500,
          easing: 'out',
        },
      }
    },
  },
}
</script>
<style scoped>
.email-stats-container {
  max-width: 1200px;
}

.filter-card {
  background-color: #f8f9fa;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .filter-form {
    flex-wrap: nowrap;
  }
}

.filter-label {
  font-weight: 500;
  white-space: nowrap;
  line-height: 31px; /* Match Bootstrap sm input height for vertical centering */
  margin-top: 0 !important; /* Reset Bootstrap default margin */
  margin-bottom: 0 !important;
}

.user-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.reliability-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.reliability-badge.reliable {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #28a745;
}

.reliability-badge.unreliable {
  background-color: #fff3cd;
  color: #856404;
  border: 1px solid #ffc107;
}

.stats-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat-card {
  flex: 1 1 auto;
  min-width: 100px;
  max-width: 150px;
  padding: 0.5rem;
  background: #fff;
  border: 1px solid #dee2e6;
  text-align: center;
}

.stat-card--unreliable {
  border-left: 3px solid #ffc107;
}

.stat-card--reliable {
  border-left: 3px solid #28a745;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: bold;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.75rem;
  color: #666;
  margin-top: 0.125rem;
}

@media (max-width: 576px) {
  .stat-card {
    min-width: 45%;
    max-width: 48%;
  }
}

/* Charts section */
.charts-section {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.chart-container {
  background: #fff;
  border: 1px solid #dee2e6;
  padding: 1rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container--small {
  min-height: 200px;
}

.chart {
  width: 100%;
  height: 280px;
}

.chart-container--small .chart {
  height: 180px;
}

.chart-loading,
.chart-error,
.chart-empty {
  text-align: center;
  padding: 2rem;
}

/* Collapse toggle text */
.collapsed > .when-open,
.not-collapsed > .when-closed {
  display: none;
}

/* Align link button with surrounding text */
:deep(.btn-link) {
  vertical-align: baseline;
  font-size: inherit;
  line-height: inherit;
}

/* Clicked links table */
.clicked-links-table code {
  background: #f8f9fa;
  padding: 0.125rem 0.25rem;
  font-size: 0.8rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
