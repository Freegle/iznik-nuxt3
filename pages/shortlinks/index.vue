<template>
  <client-only>
    <b-row class="m-0">
      <b-col cols="0" md="3" class="d-none d-md-block" />
      <b-col cols="12" md="6" class="p-0">
        <div>
          <h1>Shortlinks</h1>
          <h5>
            Shortlinks let people find Freegle communities quickly. On this page
            you can see all the shortlinks we have, and view statistics about
            them.
          </h5>
          <b-card v-if="groupOptions.length" no-body>
            <b-card-body>
              <p>
                You can also create your own shortlinks. This is particularly
                useful if you want to promote a community in a particular way,
                and then see how effective that promotion was. Keep them short
                (less typing) and memorable (less forgetting).
              </p>
              <NoticeMessage v-if="error" variant="danger" class="mb-2">
                {{ error }}
              </NoticeMessage>
              <div class="d-flex justify-content-between flex-wrap">
                <b-form-select
                  v-model="groupid"
                  :options="groupOptions"
                  class="select"
                />
                <div class="d-flex">
                  <span class="mt-2 font-weight-bold">freegle.in/</span>
                  <b-form-input
                    v-model="name"
                    placeholder="Enter your shortlink name"
                    maxlength="30"
                  />
                </div>
                <SpinButton
                  variant="primary"
                  name="save"
                  label="Create"
                  spinclass="text-white"
                  @handle="create"
                />
                <div v-if="id" class="w-100 mt-3 m-0">
                  <ShortLink :id="id" nostats />
                </div>
              </div>
            </b-card-body>
          </b-card>
        </div>
        <b-row class="mt-2 bg-white m-0 font-weight-bold">
          <b-col cols="3"> Community </b-col>
          <b-col cols="7"> Shortlink </b-col>
          <b-col cols="2" />
        </b-row>
        <ShortLinks :shortlinks="sortedLinks" />
      </b-col>
      <b-col cols="0" md="3" class="d-none d-md-block" />
    </b-row>
  </client-only>
</template>
<script>
import ShortLinks from '../../components/ShortLinks'
import NoticeMessage from '../../components/NoticeMessage'
import { useShortlinkStore } from '../../stores/shortlinks'
import { useGroupStore } from '../../stores/group'
import ShortLink from '../../components/ShortLink'
import SpinButton from '~/components/SpinButton'

definePageMeta({
  layout: 'login',
})

export default {
  components: { ShortLink, NoticeMessage, ShortLinks, SpinButton },
  async setup() {
    const shortlinkStore = useShortlinkStore()
    const groupStore = useGroupStore()
    await shortlinkStore.fetch()
    await groupStore.fetch()

    return {
      shortlinkStore,
      groupStore,
    }
  },
  data: function () {
    return {
      groupid: -1,
      name: null,
      error: null,
      id: null,
    }
  },
  computed: {
    groups() {
      return this.groupStore?.list
    },
    shortlinks() {
      return this.shortlinkStore?.list
    },
    sortedLinks() {
      if (this.shortlinks) {
        const freeglegroups = Object.values(this.shortlinks)
          .concat()
          .filter((item) => {
            return item.type === 'Group'
          })
        const sorted = freeglegroups.sort((a, b) => {
          if (a.type === 'Group' && b.type === 'Group') {
            return a.nameshort
              .toLowerCase()
              .localeCompare(b.nameshort.toLowerCase())
          }

          return 0
        })

        return sorted
      }

      return null
    },
    groupOptions() {
      const options = []

      options.push({
        value: -1,
        html: '<em>-- Please choose --</em>',
      })

      if (this.groups) {
        for (const group in this.groups) {
          options.push({
            value: this.groups[group].id,
            text: this.groups[group].namedisplay,
          })
        }
      }

      options.sort((a, b) => {
        if (a.value === -1) {
          return -1
        } else if (b.value === -1) {
          return 1
        } else {
          return a.text.toLowerCase().localeCompare(b.text.toLowerCase())
        }
      })

      return options
    },
  },
  methods: {
    async create() {
      if (this.groupid && this.name) {
        try {
          this.id = await this.shortlinkStore.add(this.groupid, this.name)

          if (!this.id) {
            this.error =
              'Failed to create.  Please make sure the link name is unique.'
          }
        } catch (e) {
          if (e.response && e.response.data) {
            // Duplicate
            this.error = e.response.data.status
          }

          console.log('Failed to create shortlink', e.response)
        }
      }
    },
  },
}
</script>
<style scoped>
.select {
  max-width: 300px;
}
</style>
