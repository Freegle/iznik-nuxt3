<template>
  <div>
    <b-card no-body>
      <b-card-body class="pl-3 pr-2 pt-2 pb-0">
        <b-row>
          <b-col cols="12" md="4">
            <div>
              <h4>
                <v-icon
                  v-if="membership.role === 'Owner'"
                  icon="crown"
                  class="text-warning"
                  title="Owner"
                />
                <v-icon
                  v-if="membership.role === 'Moderator'"
                  icon="crown"
                  class="text-info"
                  title="Moderator"
                />
                <v-icon
                  v-if="membership.role === 'Member'"
                  icon="user"
                  class="text-success"
                  title="Member"
                />
                {{ membership.nameshort }}
              </h4>
            </div>
          </b-col>
          <b-col cols="6" md="4">
            <div class="pt-1">
              {{ datetimeshort(membership.added) }}
            </div>
          </b-col>
          <b-col cols="6" md="4">
            <div class="d-flex flex-column justify-content-between">
              <ModRole
                :userid="userid"
                :groupid="membership.id"
                :role="membership.role"
              />
              <div>
                <SpinButton
                  variant="white"
                  class="mt-1"
                  icon-name="trash-alt"
                  label="Remove"
                  @handle="remove"
                />
              </div>
            </div>
          </b-col>
        </b-row>
        <div class="d-flex flex-wrap pt-1">
          <b-form-group label="OFFER and WANTED posts:" class="mr-5">
            <b-form-select
              v-model="membership.emailfrequency"
              @change="changeFrequency"
            >
              <option value="-1">Immediately</option>
              <option value="1">Every Hour</option>
              <option value="2">Every 2 Hours</option>
              <option value="4">Every 4 Hours</option>
              <option value="8">Every 8 Hours</option>
              <option value="24">Every day</option>
              <option value="0">Never</option>
            </b-form-select>
          </b-form-group>
          <b-form-group label="Moderation status:" class="mr-5">
            <b-form-select
              v-model="membership.ourpostingstatus"
              @change="changePostingStatus"
            >
              <option value="MODERATED">Moderated</option>
              <option value="DEFAULT">Group Settings</option>
              <option value="PROHIBITED">Can't Post</option>
            </b-form-select>
          </b-form-group>
          <b-form-group label="Community Event mails:" class="mr-5">
            <OurToggle
              :model-value="Boolean(membership.eventsallowed)"
              class="mt-2"
              :height="30"
              :width="100"
              :font-size="14"
              :sync="true"
              :labels="{ checked: 'Weekly', unchecked: 'Off' }"
              variant="modgreen"
              @change="changeEvents"
            />
          </b-form-group>
          <b-form-group label="Volunteer Opportunity mails:">
            <OurToggle
              :model-value="Boolean(membership.volunteeringallowed)"
              class="mt-2"
              :height="30"
              :width="100"
              :font-size="14"
              :sync="true"
              :labels="{ checked: 'Weekly', unchecked: 'Off' }"
              variant="modgreen"
              @change="changeVolunteering"
            />
          </b-form-group>
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>
<script>
// membership.id is groupid and membership.membershipid is membershipid
import { useMemberStore } from '~/stores/member'
import { useUserStore } from '~/stores/user'

export default {
  props: {
    membership: {
      type: Object,
      required: true,
    },
    userid: {
      type: Number,
      required: true,
    },
  },
  emits: ['fetchuser'],
  setup() {
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    return { memberStore, userStore }
  },
  methods: {
    async changeEvents(newval) {
      const params = {
        userid: this.userid,
        groupid: this.membership.id,
        eventsallowed: newval,
      }

      await this.memberStore.update(params)
    },
    async changeVolunteering(newval) {
      const params = {
        userid: this.userid,
        groupid: this.membership.id,
        volunteeringallowed: newval,
      }

      await this.memberStore.update(params)
    },
    async changeFrequency(newval) {
      // newval not used but this.membership.emailfrequency has new value
      const params = {
        userid: this.userid,
        groupid: this.membership.id,
        emailfrequency: this.membership.emailfrequency,
      }

      await this.memberStore.update(params)
    },
    async changePostingStatus(newval) {
      // newval not used but this.membership.ourpostingstatus has new value
      const params = {
        userid: this.userid,
        groupid: this.membership.id,
        ourpostingstatus: this.membership.ourpostingstatus,
      }

      await this.memberStore.update(params)
    },
    remove(callback) {
      this.memberStore.remove(
        this.userid,
        this.membership.id,
        this.membership.membershipid
      )
      this.$emit('fetchuser')
      if (callback) callback()
      this.checkWork(true)
    },
  },
}
</script>
