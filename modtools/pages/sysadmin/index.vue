<template>
  <div>
    <div v-if="supportOrAdmin">
      <b-tabs v-model="activeTab" content-class="mt-3" card>
        <!-- Housekeeping Tab -->
        <b-tab @click="onHousekeepingTab">
          <template #title>
            <h2 class="ms-2 me-2">Housekeeping</h2>
          </template>
          <ModSysAdminHousekeeping
            v-if="showHousekeeping"
            :key="'housekeeping-' + housekeepingBump"
          />
        </b-tab>

        <!-- Cron Jobs Tab -->
        <b-tab @click="onCronJobsTab">
          <template #title>
            <h2 class="ms-2 me-2">Cron Jobs</h2>
          </template>
          <ModSysAdminCronJobs
            v-if="showCronJobs"
            :key="'cronjobs-' + cronJobsBump"
          />
        </b-tab>

        <!-- Outgoing Email Tab -->
        <b-tab @click="onEmailStatsTab">
          <template #title>
            <h2 class="ms-2 me-2">Outgoing Email</h2>
          </template>
          <ModSupportEmailStats
            v-if="showEmailStats"
            :key="'emailstats-' + emailStatsBump"
          />
        </b-tab>

        <!-- Incoming Email Tab -->
        <b-tab @click="onIncomingEmailTab">
          <template #title>
            <h2 class="ms-2 me-2">Incoming Email</h2>
          </template>
          <ModSupportIncomingEmail
            v-if="showIncomingEmail"
            :key="'incomingemail-' + incomingEmailBump"
          />
        </b-tab>
      </b-tabs>
    </div>
    <NoticeMessage v-else variant="warning">
      You don't have access to SysAdmin tools.
    </NoticeMessage>
  </div>
</template>

<script setup>
import { useMe } from '~/composables/useMe'

const { supportOrAdmin } = useMe()

const route = useRoute()

const activeTab = ref(0)
const showHousekeeping = ref(false)
const housekeepingBump = ref(0)
const showCronJobs = ref(false)
const cronJobsBump = ref(0)
const showEmailStats = ref(false)
const emailStatsBump = ref(0)
const showIncomingEmail = ref(false)
const incomingEmailBump = ref(0)

const topTabMap = {
  housekeeping: 0,
  cronjobs: 1,
  outgoing: 2,
  incoming: 3,
}

function onHousekeepingTab() {
  showHousekeeping.value = true
  housekeepingBump.value = Date.now()
}

function onCronJobsTab() {
  showCronJobs.value = true
  cronJobsBump.value = Date.now()
}

function onEmailStatsTab() {
  showEmailStats.value = true
  emailStatsBump.value = Date.now()
}

function onIncomingEmailTab() {
  showIncomingEmail.value = true
  incomingEmailBump.value = Date.now()
}

onMounted(() => {
  const tab = route.query.tab
  if (tab && topTabMap[tab] !== undefined) {
    activeTab.value = topTabMap[tab]

    if (tab === 'housekeeping') onHousekeepingTab()
    else if (tab === 'cronjobs') onCronJobsTab()
    else if (tab === 'outgoing') onEmailStatsTab()
    else if (tab === 'incoming') onIncomingEmailTab()
  } else {
    // Default to showing housekeeping
    onHousekeepingTab()
  }
})
</script>
