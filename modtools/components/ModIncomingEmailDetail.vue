<template>
  <b-modal
    v-model="visible"
    title="Incoming Email Details"
    size="lg"
    scrollable
    hide-footer
  >
    <div v-if="entry">
      <table class="table table-sm">
        <tbody>
          <tr>
            <th class="detail-label">Time</th>
            <td>{{ formatEmailDate(entry.timestamp) }}</td>
          </tr>
          <tr>
            <th class="detail-label">Envelope From</th>
            <td class="text-break">{{ entry.envelope_from || '-' }}</td>
          </tr>
          <tr>
            <th class="detail-label">Envelope To</th>
            <td class="text-break">{{ entry.envelope_to || '-' }}</td>
          </tr>
          <tr>
            <th class="detail-label">From (Header)</th>
            <td class="text-break">{{ entry.from_address || '-' }}</td>
          </tr>
          <tr>
            <th class="detail-label">Subject</th>
            <td>{{ entry.subject || '-' }}</td>
          </tr>
          <tr>
            <th class="detail-label">Message-ID</th>
            <td class="text-break">
              <code v-if="entry.message_id">{{ entry.message_id }}</code>
              <span v-else>-</span>
            </td>
          </tr>
          <tr>
            <th class="detail-label">Routing Outcome</th>
            <td>
              <b-badge :variant="outcomeVariant(entry.routing_outcome)">
                {{ normalizeOutcome(entry.routing_outcome) }}
              </b-badge>
            </td>
          </tr>
          <tr v-if="entry.routing_reason">
            <th class="detail-label">Reason</th>
            <td>{{ entry.routing_reason }}</td>
          </tr>
          <tr v-if="entry.group_name">
            <th class="detail-label">Group</th>
            <td>
              {{ entry.group_name }}
              <span v-if="entry.group_id" class="text-muted small">
                (#{{ entry.group_id }})
              </span>
            </td>
          </tr>
          <tr v-if="entry.user_id">
            <th class="detail-label">User</th>
            <td>#{{ entry.user_id }}</td>
          </tr>
          <tr v-if="entry.to_user_id">
            <th class="detail-label">To User</th>
            <td>#{{ entry.to_user_id }}</td>
          </tr>
          <tr v-if="entry.chat_id">
            <th class="detail-label">Chat</th>
            <td>#{{ entry.chat_id }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </b-modal>
</template>

<script setup>
import { computed } from 'vue'
import { useEmailDateFormat } from '~/modtools/composables/useEmailDateFormat'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  entry: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const { formatEmailDate } = useEmailDateFormat()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

function normalizeOutcome(outcome) {
  if (!outcome) return 'Unknown'
  // Capitalize first letter for consistency
  return outcome.charAt(0).toUpperCase() + outcome.slice(1)
}

function outcomeVariant(outcome) {
  const normalized = normalizeOutcome(outcome)
  const variants = {
    Approved: 'success',
    Pending: 'warning',
    Dropped: 'secondary',
    ToUser: 'info',
    ToVolunteers: 'primary',
    IncomingSpam: 'danger',
    ToSystem: 'dark',
  }
  return variants[normalized] || 'light'
}
</script>

<style scoped>
.detail-label {
  width: 140px;
  white-space: nowrap;
  vertical-align: top;
}
</style>
