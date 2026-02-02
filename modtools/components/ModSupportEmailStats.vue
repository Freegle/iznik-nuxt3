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
        <label class="filter-label">Period:</label>
        <b-form-select
          v-model="datePreset"
          :options="datePresetOptions"
          size="sm"
          style="width: 130px"
        />
        <template v-if="datePreset === 'custom'">
          <label class="filter-label">From:</label>
          <b-form-input
            v-model="startDate"
            type="datetime-local"
            size="sm"
            style="width: 175px"
          />
          <label class="filter-label">To:</label>
          <b-form-input
            v-model="endDate"
            type="datetime-local"
            size="sm"
            style="width: 175px"
          />
        </template>
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
      <div v-if="formattedAMPStats" class="stat-card stat-card--amp">
        <div class="stat-value text-purple">
          {{ formattedAMPStats.ampPercentage }}%
        </div>
        <div class="stat-label">
          AMP
          <small class="text-muted d-block">
            {{ formattedAMPStats.totalWithAMP.toLocaleString() }} emails
          </small>
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
      <h5 class="mb-3">Opens and Clicks</h5>
      <p class="text-muted small mb-3">
        These charts show open rates and click rates. Open rates are
        underestimated due to tracking being blocked by some email clients.
        Click rates are reliable metrics.
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

      <!-- AMP Comparison Section -->
      <div v-if="emailTrackingStore.hasAMPStats" class="mt-4">
        <h5 class="mb-3">AMP vs Non-AMP Email Engagement</h5>
        <p class="text-muted small mb-3">
          <strong>Action Rate</strong> is the key comparable metric between AMP
          and non-AMP emails. It measures the percentage of recipients who took
          a meaningful action (clicked a link or replied). Open rates are shown
          separately as they are not directly comparable due to tracking
          limitations.
        </p>

        <!-- Show note when filtering by a type that has no AMP data -->
        <div
          v-if="!formattedAMPStats || formattedAMPStats.totalWithAMP === 0"
          class="alert alert-info"
        >
          <span v-if="emailType">
            No AMP data available for "{{ emailType }}" emails. AMP is currently
            only enabled for ChatNotification emails. Select "All Types" or
            "Chat Notification" to see AMP statistics.
          </span>
          <span v-else>
            No AMP email data available for the selected period.
          </span>
        </div>

        <div class="charts-grid">
          <!-- Left column: Pie chart + Bar chart -->
          <div class="chart-column">
            <!-- AMP/Non-AMP Proportion Pie Chart -->
            <div class="chart-container chart-container--small mb-3">
              <h6 class="chart-title">Email Distribution</h6>
              <GChart
                v-if="ampProportionChartData"
                type="PieChart"
                :data="ampProportionChartData"
                :options="ampProportionChartOptions"
                class="chart"
              />
            </div>
            <!-- AMP Opens by Client Type Pie Chart -->
            <div class="chart-container chart-container--small">
              <h6 class="chart-title">AMP Email Opens by Client</h6>
              <GChart
                v-if="ampClientOpenChartData"
                type="PieChart"
                :data="ampClientOpenChartData"
                :options="ampClientOpenChartOptions"
                class="chart"
              />
              <div v-else class="chart-empty text-muted small">
                No AMP client open data available.
              </div>
            </div>
          </div>

          <!-- AMP Stats Summary -->
          <div class="amp-stats-summary">
            <!-- Action Rates (Comparable) -->
            <div class="amp-stats-card amp-stats-card--action">
              <h6>
                <span class="action-rate-badge">Key Metric</span>
                Action Rates (Comparable)
              </h6>
              <table class="comparable-rates-table">
                <thead>
                  <tr>
                    <th></th>
                    <th class="text-purple">AMP Emails</th>
                    <th class="text-dark">Non-AMP Emails</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="action-rate-row">
                    <td>
                      <strong>Action Rate</strong>
                      <small class="d-block text-muted"
                        >replies + reply-clicks</small
                      >
                    </td>
                    <td class="text-purple font-weight-bold action-rate-value">
                      {{ ampResponseRateTotal }}%
                    </td>
                    <td class="font-weight-bold action-rate-value">
                      {{ nonAMPResponseRateTotal }}%
                    </td>
                  </tr>
                  <tr class="reply-breakdown">
                    <td class="text-muted smaller pl-4">via AMP form</td>
                    <td class="text-purple smaller">
                      {{ formattedAMPStats.ampReplyViaAMPRate }}%
                    </td>
                    <td class="smaller text-muted">-</td>
                  </tr>
                  <tr class="reply-breakdown">
                    <td class="text-muted smaller pl-4">via email</td>
                    <td class="text-purple smaller">
                      {{ formattedAMPStats.ampReplyViaEmailRate }}%
                    </td>
                    <td class="smaller">
                      {{ formattedAMPStats.nonAMPReplyRate }}%
                    </td>
                  </tr>
                  <tr class="reply-breakdown">
                    <td class="text-muted smaller pl-4">via web</td>
                    <td class="text-purple smaller">
                      {{ formattedAMPStats.ampReplyClickRate }}%
                    </td>
                    <td class="smaller">
                      {{ formattedAMPStats.nonAMPReplyClickRate }}%
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr class="text-muted small">
                    <td>Other Clicks</td>
                    <td>{{ formattedAMPStats.ampOtherClickRate }}%</td>
                    <td>{{ formattedAMPStats.nonAMPOtherClickRate }}%</td>
                  </tr>
                  <tr class="text-muted small">
                    <td>Emails sent</td>
                    <td>
                      {{ formattedAMPStats.totalWithAMP.toLocaleString() }}
                    </td>
                    <td>
                      {{ formattedAMPStats.totalWithoutAMP.toLocaleString() }}
                    </td>
                  </tr>
                </tfoot>
              </table>
              <p class="small text-muted mt-3 mb-0">
                <strong>Action Rate</strong> = users who replied (via AMP form,
                email, or web clicks). This is directly comparable between AMP
                and non-AMP emails.
              </p>
            </div>

            <!-- Open Rates (Not Comparable) -->
            <div class="amp-stats-card amp-stats-card--open-rates">
              <h6>
                <span class="open-rate-badge">Indicative Only</span>
                Open Rates (Not Comparable)
              </h6>
              <table class="comparable-rates-table">
                <thead>
                  <tr>
                    <th></th>
                    <th class="text-purple">AMP Emails</th>
                    <th class="text-dark">Non-AMP Emails</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Open Rate</td>
                    <td class="text-purple">
                      {{ formattedAMPStats.ampOpenRate }}%
                    </td>
                    <td>{{ formattedAMPStats.nonAMPOpenRate }}%</td>
                  </tr>
                </tbody>
              </table>
              <p class="small text-muted mt-2 mb-0">
                <strong>Why not comparable?</strong> Non-AMP open rates are
                underestimated because many email clients block tracking pixels.
                AMP open rates are reliable because the AMP content is fetched
                from our servers. Use open rates for trends within the same
                category, not for AMP vs non-AMP comparison.
              </p>
            </div>
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
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { GChart } from 'vue-google-charts'
import { useEmailTrackingStore } from '~/modtools/stores/emailtracking'

const emailTrackingStore = useEmailTrackingStore()

// Default to last 7 days.
const today = new Date()
const sevenDaysAgo = new Date(today)
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

// Format as local ISO datetime for datetime-local inputs (adjusts for timezone)
const toLocalISOString = (d) => {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19)
}

const showInfoModal = ref(false)
const datePreset = ref('7days')
const startDate = ref(toLocalISOString(sevenDaysAgo))
const endDate = ref(toLocalISOString(today))
const emailType = ref('')
const userIdOrEmail = ref('')

const datePresetOptions = [
  { text: 'Last hour', value: 'hour' },
  { text: 'Last 24 hours', value: 'day' },
  { text: 'Last 7 days', value: '7days' },
  { text: 'Last 30 days', value: '30days' },
  { text: 'Custom dates', value: 'custom' },
]

const emailTypeOptions = [
  { text: 'All Types', value: '' },
  { text: 'Chat Notification', value: 'ChatNotification' },
  {
    text: 'Chat Notification (User to Mod)',
    value: 'ChatNotificationUser2Mod',
  },
  {
    text: 'Chat Notification (Mod to Mod)',
    value: 'ChatNotificationMod2Mod',
  },
  { text: 'Welcome', value: 'WelcomeMail' },
  { text: 'Digest', value: 'UnifiedDigest' },
  { text: 'Donation Thank You', value: 'DonationThank' },
  { text: 'Donation Ask', value: 'DonationAsk' },
]

const emailFields = [
  { key: 'email_type', label: 'Type', sortable: true },
  { key: 'subject', label: 'Subject', sortable: false },
  { key: 'sent_at', label: 'Sent', sortable: true },
  { key: 'opened_at', label: 'Opened', sortable: true },
  { key: 'clicked_at', label: 'Clicked', sortable: true },
  { key: 'bounced_at', label: 'Bounced', sortable: true },
  { key: 'unsubscribed_at', label: 'Unsubscribed', sortable: true },
]

const formattedStats = computed(() => {
  const stats = emailTrackingStore.formattedStats
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
})

const formattedAMPStats = computed(() => {
  const stats = emailTrackingStore.formattedAMPStats
  if (!stats) return null

  const totalWithAMP = parseInt(stats.totalWithAMP) || 0
  const totalWithoutAMP = parseInt(stats.totalWithoutAMP) || 0
  const ampOpened = parseInt(stats.ampOpened) || 0
  const nonAMPOpened = parseInt(stats.nonAMPOpened) || 0
  const totalEmails = totalWithAMP + totalWithoutAMP
  const totalOpened = ampOpened + nonAMPOpened
  const totalOpenRate =
    totalEmails > 0 ? ((totalOpened / totalEmails) * 100).toFixed(1) : '0.0'

  // Calculate non-AMP client open rate for AMP emails
  // This is AMP emails that were opened but NOT via AMP rendering (opened in non-AMP clients)
  const ampRenderRateNum = parseFloat(stats.ampRenderRate) || 0
  const ampOpenRateNum = parseFloat(stats.ampOpenRate) || 0
  const ampNonAMPClientOpenRate = Math.max(
    0,
    ampOpenRateNum - ampRenderRateNum
  ).toFixed(1)

  // Calculate total click rate
  const ampClicked = parseInt(stats.ampClicked) || 0
  const nonAMPClicked = parseInt(stats.nonAMPClicked) || 0
  const totalClicked = ampClicked + nonAMPClicked
  const totalClickRate =
    totalEmails > 0 ? ((totalClicked / totalEmails) * 100).toFixed(1) : '0.0'

  return {
    totalWithAMP,
    totalWithoutAMP,
    totalEmails,
    ampPercentage: stats.ampPercentage,
    ampRendered: parseInt(stats.ampRendered) || 0,
    ampRenderRate: stats.ampRenderRate,
    ampNonAMPClientOpenRate,
    ampOpened,
    ampOpenRate: stats.ampOpenRate,
    ampClickRate: stats.ampClickRate,
    ampBounceRate: stats.ampBounceRate,
    ampReplyRate: stats.ampReplyRate,
    ampActionRate: stats.ampActionRate,
    // Response rate and breakdown
    ampResponseRate: stats.ampResponseRate,
    ampReplyViaAMPRate: stats.ampReplyViaAMPRate,
    ampReplyViaEmailRate: stats.ampReplyViaEmailRate,
    ampReplyClickRate: stats.ampReplyClickRate,
    ampOtherClickRate: stats.ampOtherClickRate,
    nonAMPOpened,
    nonAMPOpenRate: stats.nonAMPOpenRate,
    nonAMPClickRate: stats.nonAMPClickRate,
    nonAMPBounceRate: stats.nonAMPBounceRate,
    nonAMPReplyRate: stats.nonAMPReplyRate,
    nonAMPActionRate: stats.nonAMPActionRate,
    // Non-AMP response rate and breakdown
    nonAMPResponseRate: stats.nonAMPResponseRate,
    nonAMPReplyClickRate: stats.nonAMPReplyClickRate,
    nonAMPOtherClickRate: stats.nonAMPOtherClickRate,
    totalOpened,
    totalOpenRate,
    totalClicked,
    totalClickRate,
  }
})

const ampProportionChartData = computed(() => {
  if (!formattedAMPStats.value) return null
  const { totalWithAMP, totalWithoutAMP } = formattedAMPStats.value
  if (totalWithAMP === 0 && totalWithoutAMP === 0) return null

  return [
    ['Type', 'Count'],
    ['AMP Emails', totalWithAMP],
    ['Non-AMP Emails', totalWithoutAMP],
  ]
})

const ampProportionChartOptions = {
  pieHole: 0.4,
  colors: ['#6f42c1', '#6c757d'],
  legend: { position: 'bottom', textStyle: { fontSize: 11 } },
  chartArea: { width: '90%', height: '75%' },
  pieSliceText: 'percentage',
  pieSliceTextStyle: { fontSize: 11 },
  tooltip: { text: 'both' },
}

const ampClientOpenChartData = computed(() => {
  if (!formattedAMPStats.value) return null
  const { ampRendered, ampOpened } = formattedAMPStats.value
  if (ampOpened === 0) return null

  // AMP emails opened: how many were opened in AMP-enabled vs non-AMP clients
  const ampClientOpens = ampRendered || 0
  const nonAMPClientOpens = Math.max(0, ampOpened - ampClientOpens)

  if (ampClientOpens === 0 && nonAMPClientOpens === 0) return null

  return [
    ['Client Type', 'Opens'],
    ['AMP-enabled client', ampClientOpens],
    ['Non-AMP client', nonAMPClientOpens],
  ]
})

const ampClientOpenChartOptions = {
  pieHole: 0.4,
  colors: ['#6f42c1', '#adb5bd'],
  legend: { position: 'bottom', textStyle: { fontSize: 11 } },
  chartArea: { width: '90%', height: '75%' },
  pieSliceText: 'percentage',
  pieSliceTextStyle: { fontSize: 11 },
  tooltip: { text: 'both' },
}

const clickedLinksFieldsComputed = computed(() => {
  if (emailTrackingStore.aggregateClickedLinks) {
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
})

const ampResponseRateTotal = computed(() => {
  if (!formattedAMPStats.value) return '0.0'
  const viaAMP = parseFloat(formattedAMPStats.value.ampReplyViaAMPRate) || 0
  const viaEmail = parseFloat(formattedAMPStats.value.ampReplyViaEmailRate) || 0
  const viaWeb = parseFloat(formattedAMPStats.value.ampReplyClickRate) || 0
  return (viaAMP + viaEmail + viaWeb).toFixed(1)
})

const nonAMPResponseRateTotal = computed(() => {
  if (!formattedAMPStats.value) return '0.0'
  const viaEmail = parseFloat(formattedAMPStats.value.nonAMPReplyRate) || 0
  const viaWeb = parseFloat(formattedAMPStats.value.nonAMPReplyClickRate) || 0
  return (viaEmail + viaWeb).toFixed(1)
})

watch(datePreset, (newPreset) => {
  // Handle period changes - set dates and fetch stats
  onDatePresetChange(newPreset)
})

watch(emailType, () => {
  fetchStats()
})

watch(startDate, () => {
  if (datePreset.value === 'custom') {
    fetchStats()
  }
})

watch(endDate, () => {
  if (datePreset.value === 'custom') {
    fetchStats()
  }
})

onMounted(() => {
  // Auto-fetch stats when the component is displayed.
  fetchStats()
})

async function fetchStats() {
  emailTrackingStore.setFilters({
    type: emailType.value,
    start: startDate.value,
    end: endDate.value,
  })
  // Fetch all data in parallel.
  await Promise.all([
    emailTrackingStore.fetchStats(),
    emailTrackingStore.fetchTimeSeries(),
    emailTrackingStore.fetchStatsByType(),
    emailTrackingStore.fetchClickedLinks(),
  ])
}

async function fetchUserEmails() {
  if (!userIdOrEmail.value) return
  const input = userIdOrEmail.value.trim()
  // If it looks like an email, pass as string; otherwise parse as int.
  if (input.includes('@')) {
    await emailTrackingStore.fetchUserEmails(input)
  } else {
    await emailTrackingStore.fetchUserEmails(parseInt(input))
  }
}

async function loadMoreUserEmails() {
  await emailTrackingStore.loadMoreUserEmails()
}

function onDatePresetChange(preset) {
  const now = new Date()

  let start
  const end = now

  switch (preset) {
    case 'hour':
      start = new Date(now)
      start.setHours(start.getHours() - 1)
      // For hour/day, send full datetime string (YYYY-MM-DD HH:MM:SS)
      startDate.value = formatDateTimeForAPI(start)
      endDate.value = formatDateTimeForAPI(end)
      fetchStats()
      return
    case 'day':
      start = new Date(now)
      start.setDate(start.getDate() - 1)
      // For hour/day, send full datetime string (YYYY-MM-DD HH:MM:SS)
      startDate.value = formatDateTimeForAPI(start)
      endDate.value = formatDateTimeForAPI(end)
      fetchStats()
      return
    case '7days':
      start = new Date(now)
      start.setDate(start.getDate() - 7)
      break
    case '30days':
      start = new Date(now)
      start.setDate(start.getDate() - 30)
      break
    case 'custom':
      // Keep current dates, user will set them manually.
      return
    default:
      start = new Date(now)
      start.setDate(start.getDate() - 7)
  }

  // For longer periods, just use date (YYYY-MM-DD)
  startDate.value = start.toISOString().split('T')[0]
  endDate.value = now.toISOString().split('T')[0]
  fetchStats()
}

function formatDateTimeForAPI(date) {
  // Format as ISO 8601 local datetime (YYYY-MM-DDTHH:MM:SS)
  // This format works with datetime-local inputs and the API
  const pad = (n) => String(n).padStart(2, '0')
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    'T' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Chart options for Google Charts.
function getEngagementChartOptions() {
  return {
    title: 'Opens and Clicks Over Time',
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
      0: { color: '#28a745' }, // Open rate - green
      1: { color: '#17a2b8' }, // Click rate - blue
    },
    animation: {
      startup: true,
      duration: 500,
      easing: 'out',
    },
  }
}

function getTypeComparisonOptions() {
  return {
    title: 'Opens and Clicks by Email Type',
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
      0: { color: '#28a745' }, // Open rate - green
      1: { color: '#17a2b8' }, // Click rate - blue
    },
    bar: { groupWidth: '70%' },
    animation: {
      startup: true,
      duration: 500,
      easing: 'out',
    },
  }
}

function getVolumeChartOptions() {
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

.smaller {
  font-size: 0.65rem !important;
  opacity: 0.8;
}

.reply-breakdown td {
  font-size: 0.65rem !important;
  padding-top: 0.1rem !important;
  padding-bottom: 0.1rem !important;
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

/* AMP Statistics */
.stat-card--amp {
  border-left: 3px solid #6f42c1;
}

.text-purple {
  color: #6f42c1 !important;
}

.amp-stats-summary {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
}

.amp-stats-card {
  padding: 0.75rem;
  background: #fff;
  border: 1px solid #e9ecef;
}

.amp-stats-card--highlight {
  border-left: 3px solid #6f42c1;
  background: #f8f5ff;
}

.amp-stats-card h6 {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #495057;
}

.amp-stat-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0;
  font-size: 0.8125rem;
}

.amp-stat-label {
  color: #6c757d;
}

.amp-stat-value {
  font-weight: 600;
}

.amp-stat-pct {
  font-size: 0.75rem;
  color: #6c757d;
  margin-left: 0.25rem;
}

.amp-stats-card--chart {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.amp-pie-chart {
  height: 140px;
  margin-top: 0.25rem;
}

/* Chart column layout */
.chart-column {
  display: flex;
  flex-direction: column;
}

.chart-title {
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #495057;
  text-align: center;
}

/* Comparable rates section */
.amp-stats-card--rates {
  border-left: 3px solid #28a745;
}

/* Comparable rates table */
.comparable-rates-table {
  width: 100%;
  font-size: 0.875rem;
  border-collapse: collapse;
}

.comparable-rates-table th,
.comparable-rates-table td {
  padding: 0.5rem;
  text-align: center;
  border-bottom: 1px solid #e9ecef;
}

.comparable-rates-table th:first-child,
.comparable-rates-table td:first-child {
  text-align: left;
  font-weight: 600;
}

.comparable-rates-table thead th {
  font-weight: 600;
  font-size: 0.8125rem;
}

.comparable-rates-table tbody td {
  font-size: 1rem;
}

.comparable-rates-table tfoot td {
  border-bottom: none;
  font-size: 0.75rem;
}

/* AMP comparison table */
.amp-comparison-table {
  width: 100%;
  font-size: 0.8125rem;
  border-collapse: collapse;
}

.amp-comparison-table th,
.amp-comparison-table td {
  padding: 0.375rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.amp-comparison-table th {
  font-weight: 600;
  color: #495057;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.amp-comparison-table th:not(:first-child),
.amp-comparison-table td:not(:first-child) {
  text-align: right;
}

.amp-comparison-table tbody tr:last-child td {
  border-bottom: none;
}

/* Action rates card (key metric) */
.amp-stats-card--action {
  border-left: 3px solid #28a745;
  background: #f8fff8;
}

.amp-stats-card--action h6 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.action-rate-badge {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #28a745;
  color: #fff;
  border-radius: 3px;
}

.action-rate-row {
  background: #f0f9f0;
}

.action-rate-value {
  font-size: 1.25rem;
}

/* Open rates card (indicative only) */
.amp-stats-card--open-rates {
  border-left: 3px solid #ffc107;
  background: #fffef8;
}

.amp-stats-card--open-rates h6 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.open-rate-badge {
  display: inline-block;
  padding: 0.125rem 0.375rem;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  background: #ffc107;
  color: #856404;
  border-radius: 3px;
}

.pl-3 {
  padding-left: 1rem;
}
</style>
