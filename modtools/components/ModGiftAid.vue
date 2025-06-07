<template>
  <div v-if="!hide">
    <b-row>
      <b-col cols="6" md="3" class="pl-3">
        <div>
          <b-form-input
            v-model="giftaid.fullname"
            :class="{ 'border-danger': nameInvalid }"
          />
          <div v-if="email">
            <!-- eslint-disable-next-line -->
            <ExternalLink :href="'mailto:' + email + '?subject=A question about your Gift Aid declaration'"><v-icon icon="envelope" />&nbsp;{{ email
              }}</ExternalLink>
          </div>
          <NoticeMessage v-if="giftaid.donations" variant="info">
            Total donations &pound;{{ giftaid.donations }}
          </NoticeMessage>
          <NoticeMessage v-else variant="danger">
            No donations found - please ask what donation method they used and
            if their donation was made using a different email address. If so
            then you need to add that as a secondary email address on their
            account using Support Tools.
          </NoticeMessage>
          <span class="small text-muted">
            {{ timeago(giftaid.timestamp) }}
            User ID <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
              giftaid.userid
            }}
            Gift Aid ID
            <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
              giftaid.id
            }}
          </span>
        </div>
      </b-col>
      <b-col cols="6" md="5">
        <b-form-textarea v-model="giftaid.homeaddress" rows="4" />
        <b-form-input
          v-model="giftaid.housenameornumber"
          :class="{ 'border-danger': houseInvalid, 'mt-1': true }"
          placeholder="House name or number"
        />
        <b-form-input
          v-model="giftaid.postcode"
          :class="{ 'border-danger': postcodeInvalid, 'mt-1': true }"
          placeholder="Postcode"
        />
      </b-col>
      <b-col cols="6" md="4" class="">
        <SpinButton
          variant="white"
          icon-name="save"
          label="Save Changes"
          @handle="save"
        />
        <SpinButton
          variant="warning"
          icon-name="trash-alt"
          label="Give Up"
          confirm
          @handle="giveup"
        />
        <SpinButton
          variant="success"
          icon-name="check"
          label="Looks Good"
          :disabled="
            houseInvalid || postcodeInvalid || nameInvalid || !giftaid.donations
          "
          @handle="reviewed"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col>
        <hr />
      </b-col>
    </b-row>
  </div>
</template>
<script>
export default {
  props: {
    giftaid: {
      type: Object,
      required: true,
    },
  },
  data: function () {
    return {
      hide: false,
    }
  },
  computed: {
    nameInvalid() {
      return !this.giftaid.fullname.includes(' ')
    },
    postcodeInvalid() {
      return !this.giftaid.postcode || !this.giftaid.postcode.includes(' ')
    },
    houseInvalid() {
      return !this.giftaid.housenameornumber
    },
    email() {
      let email = null

      if (this.giftaid.email) {
        this.giftaid.email.forEach((e) => {
          if (!e.ourdomain && (e.preferred || email === null)) {
            email = e.email
          }
        })
      }

      return email
    },
  },
  methods: {
    save(callback) {
      const { id, period, fullname, homeaddress, postcode, housenameornumber } =
        this.giftaid
      this.$api.giftaid.edit(
        id,
        period,
        fullname,
        homeaddress,
        postcode,
        housenameornumber,
        false
      )
      callback()
    },
    reviewed(callback) {
      this.$api.giftaid.edit(
        this.giftaid.id,
        null,
        null,
        null,
        null,
        null,
        true
      )
      callback()
      this.hide = true
    },
    giveup(callback) {
      if (!this.giftaid.donations) {
        // Approve these as a way of getting them off the list even though they're not linked to a donation.
        this.reviewed()
      } else {
        this.$api.giftaid.edit(
          this.giftaid.id,
          null,
          null,
          null,
          null,
          null,
          false,
          true
        )
        this.hide = true
      }
      callback()
    },
  },
}
</script>
