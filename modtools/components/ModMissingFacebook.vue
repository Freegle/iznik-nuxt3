<template>
  <div>
    <NoticeMessage v-if="invalid.length" variant="danger">
      <div v-if="summary">
        <v-icon icon="exclamation-triangle" /> {{ invalid.length }} Facebook
        {{ pluralise(['page has', 'pages have'], invalid.length) }} become
        unlinked.
        <b-button variant="white" @click="expand"> Click to view </b-button>
      </div>
      <div v-else>
        <div v-for="inv of invalid" :key="'fbinvalid-' + inv.page.uid">
          <p>
            Facebook page
            <a
              :href="'https://facebook.com/' + inv.page.id"
              target="_blank"
              rel="noopener nofollower"
              >{{ inv.page.name }}</a
            >
            for community
            <strong>{{ inv.group.namedisplay }}</strong>
          </p>
          <ExternalLink
            class="btn btn-white mb-2"
            :href="
              'https://modtools.org/facebook/facebook_request.php?type=Page&groupid=' +
              inv.group.id
            "
          >
            Relink
          </ExternalLink>
        </div>
      </div>
    </NoticeMessage>
    <NoticeMessage v-if="notlinked.length" variant="warning" class="mt-1">
      <div v-if="summary">
        <v-icon icon="exclamation-triangle" />
        {{
          pluralise(
            ['community needs', 'communities need'],
            notlinked.length,
            true
          )
        }}
        to be linked to a Facebook page.
        <b-button variant="white" @click="expand"> Click to view </b-button>
      </div>
      <div v-else>
        <p>
          Communities can be linked to a Facebook page, to get extra publicity.
          Some of your groups aren't.
        </p>
        <p>
          Please click to go to the Settings page where you can link from the
          <em>Social Media</em> section.
        </p>
        <div v-for="inv of notlinked" :key="'fbnotlinked-' + inv.group.id">
          <nuxt-link :to="'/settings/' + inv.group.id">
            {{ inv.group.namedisplay }}
          </nuxt-link>
        </div>
      </div>
    </NoticeMessage>
  </div>
</template>
<script>
import { pluralise } from '~/composables/usePluralise'

export default {
  data: function () {
    return {
      summary: true,
    }
  },
  computed: {
    invalid() {
      const ret = []

      for (const group of this.myGroups) {
        if (
          group.type === 'Freegle' &&
          group.facebook &&
          (group.role === 'Moderator' || group.role === 'Owner') &&
          group.publish
        ) {
          for (const fb of group.facebook) {
            if (!fb.valid && fb.type === 'Page') {
              ret.push({
                page: fb,
                group,
              })
            }
          }
        }
      }

      return ret
    },
    notlinked() {
      const ret = []

      for (const group of this.myGroups) {
        if (
          group.type === 'Freegle' &&
          (group.role === 'Moderator' || group.role === 'Owner') &&
          group.publish
        ) {
          if (!group.facebook) {
            ret.push({
              group,
            })
          } else {
            let valid = true
            group.facebook.forEach((f) => {
              if (!f.valid) {
                valid = false
              }
            })

            if (!valid) {
              ret.push({
                group,
              })
            }
          }
        }
      }

      return ret
    },
  },
  methods: {
    expand() {
      this.summary = false
    },
  },
}
</script>
