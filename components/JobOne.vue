<template>
  <div v-if="job" @click="clicked">
    <div v-if="summary" class="ml-2 mr-2">
      <ExternalLink :href="job.url">
        <h4 :class="className">
          {{ title }}
          <span v-if="job.location" class="text-muted small">
            <span class="small">
              {{ location }}
            </span>
          </span>
        </h4>
        <p v-if="showBody" class="text-truncate mt-2 d-none d-lg-block black">
          {{ body }}
        </p>
      </ExternalLink>
    </div>
    <b-card
      v-else
      no-body
      variant="info"
      :class="highlight ? 'job-row bg-info' : 'job-row'"
    >
      <b-card-body class="job-row">
        <b-card-title class="job-title">
          {{ title }}
        </b-card-title>
        <b-card-subtitle v-if="job.location">
          <span class="location">
            {{ location }}
          </span>
        </b-card-subtitle>
        <b-row>
          <b-col>
            <div class="media clickme">
              <div class="media-left" />
              <div class="media-body w-100">
                <p class="text-truncate mt-2 job-description">
                  {{ body }}
                </p>
              </div>
            </div>
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <ExternalLink :href="job.url">
              <b-button variant="primary"> More Info </b-button>
            </ExternalLink>
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
  </div>
</template>
<script>
import { useJobStore } from '../stores/job'
import ExternalLink from '~/components/ExternalLink'

export default {
  components: { ExternalLink },
  props: {
    id: {
      type: Number,
      required: true,
    },
    summary: {
      type: Boolean,
      required: false,
      default: false,
    },
    highlight: {
      type: Boolean,
      required: false,
      default: false,
    },
    showBody: {
      type: Boolean,
      required: false,
      default: true,
    },
    className: {
      type: String,
      required: false,
      default: '',
    },
  },
  setup() {
    const jobStore = useJobStore()

    return {
      jobStore,
    }
  },
  computed: {
    job() {
      return this.jobStore?.byId(this.id)
    },
    title() {
      if (!this.job?.title) {
        return ''
      }

      return this.filterNonsense(this.job.title)
    },
    location() {
      if (
        this.job &&
        this.job.location &&
        this.job.location.indexOf(', ') === 0
      ) {
        return this.job.location.substring(2)
      } else {
        return this.job.location
      }
    },
    body() {
      if (!this.job || !this.job.body) {
        return ''
      }

      return this.filterNonsense(this.job.body)
    },
  },
  methods: {
    clicked() {
      this.jobStore.log({
        id: this.job.id,
      })
    },
    filterNonsense(val) {
      return val
        .replace(/\\n/g, '\n')
        .replace(/<br>/g, '\n')
        .replace(/Â£/g, '£')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036F]/g, '')
    },
  },
}
</script>
<style scoped>
.job__summary {
  font-weight: 500;
}
</style>
