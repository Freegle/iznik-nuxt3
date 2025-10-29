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
<script>
import { useUserStore } from '~/stores/user'

export default {
  data() {
    return {
      emails: null,
      results: [],
    }
  },
  methods: {
    check() {
      this.results = []
      const emails = this.emails.split('\n').map((email) => email.trim())
      emails.forEach(async (email) => {
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
              this.results.push({
                text: email + ': Volunteer',
                error: false,
              })
            } else {
              this.results.push({
                text: email + ': Not a volunteer',
                error: true,
              })
            }
          } else if (ret.length > 1) {
            console.log('More than 1 match found', ret)
            this.results.push({
              text: email + ': More than 1 match found - check email',
              error: true,
            })
          } else {
            this.results.push({
              text: email + ': Not found',
              error: true,
            })
          }
        }
      })
    },
  },
}
</script>
