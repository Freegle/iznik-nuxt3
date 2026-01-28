<template>
  <div
    v-if="latestMessage"
    :class="{
      'alert alert-danger':
        backupStatus === 'stale' ||
        backupStatus === 'restore-failed' ||
        backupStatus === 'unreachable',
      'alert alert-warning': backupStatus === 'warning',
      'alert alert-success': backupStatus === null,
    }"
  >
    <strong>System backed up on Yesterday up to:</strong>
    {{ latestMessage }}
    <span v-if="backupStatus === 'stale'"> ❌ Backup is over 2 days old!</span>
    <span v-if="backupStatus === 'restore-failed'">
      ❌ Latest restore attempt failed - check logs</span
    >
    <span v-if="backupStatus === 'unreachable'"> ❌ Server unreachable</span>
    <span v-if="isRestoring"> ⚠️ Backup is currently restoring</span>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

const latestMessage = ref(null)
const backupStatus = ref(null)
const isRestoring = ref(false)

onMounted(async () => {
  try {
    // First check Yesterday's restore status - this tells us if backups are actually working
    const restoreResponse = await fetch(
      'https://yesterday.ilovefreegle.org:8444/api/restore-status'
    )

    if (restoreResponse.ok) {
      const restoreData = await restoreResponse.json()

      if (restoreData.inProgress && restoreData.backupDate) {
        // A restore is currently in progress
        const formattedDate = dayjs(restoreData.backupDate, 'YYYYMMDD').format(
          'D MMM YYYY'
        )
        latestMessage.value = `Restoring backup from ${formattedDate}...`
        backupStatus.value = 'warning'
        isRestoring.value = true
      } else if (
        restoreData.status === 'failed' ||
        restoreData.status === 'completed' ||
        restoreData.status === 'idle'
      ) {
        // Check what backup is currently loaded (even if last restore attempt failed)
        const lastRestoreFailed = restoreData.status === 'failed'
        try {
          const currentBackupResponse = await fetch(
            'https://yesterday.ilovefreegle.org:8444/api/current-backup'
          )
          if (currentBackupResponse.ok) {
            const currentBackup = await currentBackupResponse.json()
            if (currentBackup.date) {
              const backupDate = dayjs(currentBackup.date, 'YYYYMMDD')
              const formattedDate = backupDate.format('D MMM YYYY')
              // Show backup creation time (from filename), not when it was loaded
              const backupTime = currentBackup.backup_time || ''
              latestMessage.value = `${formattedDate}${
                backupTime ? ' ' + backupTime : ''
              }`

              // Check if backup is stale (more than 2 days old)
              const backupAge = dayjs().diff(backupDate, 'day')
              if (backupAge > 2) {
                backupStatus.value = 'stale'
              } else if (lastRestoreFailed) {
                // Backup is current but last restore attempt failed
                backupStatus.value = 'restore-failed'
              } else {
                backupStatus.value = null
              }
            } else {
              latestMessage.value = 'Unknown backup date'
              backupStatus.value = 'warning'
            }
          } else {
            latestMessage.value = 'Could not fetch backup info'
            backupStatus.value = 'warning'
          }
        } catch (e) {
          latestMessage.value = 'Could not fetch backup info'
          backupStatus.value = 'warning'
        }
      } else {
        // Unknown status
        latestMessage.value = 'Unknown backup status'
        backupStatus.value = 'warning'
      }
    } else {
      latestMessage.value = 'Yesterday API unavailable'
      backupStatus.value = 'warning'
    }
  } catch (e) {
    // If Yesterday API is not accessible, show error - don't pretend things are fine
    latestMessage.value = 'Cannot reach Yesterday server'
    backupStatus.value = 'unreachable'
  }
})
</script>
