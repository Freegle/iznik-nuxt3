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
                {{ entry.routing_outcome }}
              </b-badge>
            </td>
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

function outcomeVariant(outcome) {
  const variants = {
    Approved: 'success',
    Pending: 'warning',
    Dropped: 'secondary',
    ToUser: 'info',
    ToVolunteers: 'primary',
    IncomingSpam: 'danger',
    ToSystem: 'dark',
    dropped: 'secondary',
  }
  return variants[outcome] || 'light'
}
</script>

<style scoped>
.detail-label {
  width: 140px;
  white-space: nowrap;
  vertical-align: top;
}
</style>
