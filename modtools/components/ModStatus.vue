<template>
  <span
    title="Platform Status - click for more info"
    class="clickme"
    @click="clicked"
  >
    <span v-if="!tried" class="trying" />
    <span v-else-if="error" class="error" />
    <span v-else-if="warning && supportOrAdmin" class="warning" />
    <span v-else class="fine" />
    <b-modal
      id="statusmmodal"
      ref="modal"
      no-stacking
      size="lg"
      :title="'Platform Status: ' + headline"
    >
      <template #default>
        <NoticeMessage
          v-if="(warning || error) && supportOrAdmin"
          variant="warning"
          class="mb-2"
        >
          There is a problem. If this just mentions
          <strong>security patches or reboots</strong>, you can ignore it, but
          if it's something else please alert geeks@ilovefreegle.org if this
          persists for more than an hour.
        </NoticeMessage>
        <NoticeMessage v-else-if="error" variant="warning" class="mb-2">
          There's a problem, and parts of the system may not be working. The
          Geeks will be on the case.
        </NoticeMessage>
        <NoticeMessage v-else-if="warning" variant="warning" class="mb-2">
          There's a problem, but the system should still be working. The Geeks
          will be on the case.
        </NoticeMessage>
        <NoticeMessage v-else variant="primary">
          Everything seems fine.
        </NoticeMessage>
        <div v-if="status && status.info">
          <div v-for="(stat, server) in status.info" :key="server">
            <div v-if="stat.warning" class="d-flex justify-content-between">
              <strong>{{ server }}</strong>
              <em>{{ stat.warningtext }}</em>
            </div>
            <div v-if="stat.error" class="d-flex justify-content-between">
              <strong>{{ server }}</strong>
              <em>{{ stat.errortext }}</em>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </span>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useNuxtApp } from '#app'
import { useOurModal } from '~/composables/useOurModal'
import { useMe } from '~/composables/useMe'

const { $api } = useNuxtApp()
const { modal, hide } = useOurModal()
const { supportOrAdmin } = useMe()

const status = ref(null)
const updated = ref(null)
const tried = ref(false)
let timer = null

const outOfDate = computed(() => {
  // Check if we've managed to get it recently.
  return !updated.value || Date.now() - updated.value >= 1000 * 600
})

const error = computed(() => (status.value ? status.value.error : false))

const warning = computed(() => {
  return outOfDate.value || (status.value && status.value.warning)
})

const headline = computed(() => {
  if (outOfDate.value) {
    return 'Not sure'
  } else if (warning.value) {
    return 'Warning'
  } else if (error.value) {
    return 'Error'
  } else {
    return 'Fine'
  }
})

async function checkStatus() {
  try {
    status.value = await $api.status.fetch()

    tried.value = true

    if (status.value.ret === 0) {
      updated.value = Date.now()
    }
  } catch (err) {
    console.warn('Status API error:', err)
    tried.value = true
    status.value = {
      ret: 1,
      warning: true,
      info: {
        'Status API': {
          warning: true,
          warningtext: 'Cannot access status file - system status unknown',
        },
      },
    }
  }

  timer = setTimeout(checkStatus, 30000)
}

function clicked(e) {
  modal.value.show()
  e.preventDefault()
  e.stopPropagation()
}

onMounted(() => {
  checkStatus()
  hide()
})

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
  }
})
</script>
<style scoped lang="scss">
.trying {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: $color-gray--light;
  display: block;
}

.error {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: $color-red;
  display: block;
}

.warning {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: $color-orange--dark;
  display: block;
}

.fine {
  border-radius: 50%;
  width: 20px;
  height: 20px;
  background-color: $color-green--medium;
  display: block;
}
</style>
