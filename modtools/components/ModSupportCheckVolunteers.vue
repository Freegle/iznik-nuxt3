<template>
  <div>
    <p>
      Paste in email addresses, one per line, and check whether they are still
      volunteers. This is useful for checking membership of our legal entity.
    </p>
    <b-form-textarea v-model="emails" rows="10" />
    <b-button variant="primary" class="mt-2" @click="check"> Check </b-button>
    <div v-if="results.length">
      <h2>Results</h2>
      <div v-for="result in results" :key="result">
        <div v-if="result.error" class="text-danger">
          {{ result.text }}
        </div>
        <div v-else>
          {{ result.text }}
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useUserStore } from '~/stores/user'

const emails = ref(null)
const results = ref([])

function check() {
  results.value = []
  const emailList = emails.value.split('\n').map((email) => email.trim())
  emailList.forEach(async (email) => {
    if (email) {
      const userStore = useUserStore()
      userStore.clear()

      console.log('check fetchMT', email)
      const ret = await userStore.fetchMT({
        search: email,
        emailhistory: false,
      })

      if (ret.length === 1) {
        if (
          ret[0].systemrole === 'Admin' ||
          ret[0].systemrole === 'Moderator' ||
          ret[0].systemrole === 'Support'
        ) {
          results.value.push({
            text: email + ': Volunteer',
            error: false,
          })
        } else {
          results.value.push({
            text: email + ': Not a volunteer',
            error: true,
          })
        }
      } else if (ret.length > 1) {
        console.log('More than 1 match found', ret)
        results.value.push({
          text: email + ': More than 1 match found - check email',
          error: true,
        })
      } else {
        results.value.push({
          text: email + ': Not found',
          error: true,
        })
      }
    }
  })
}
</script>
