<template>
  <div v-if="!hide">
    <b-row>
      <b-col cols="6" md="3" class="pl-3">
        <div>
          <b-form-input
            v-model="editgiftaid.fullname"
            :class="{ 'border-danger': nameInvalid }"
          />
          <div v-if="email">
            <!-- eslint-disable-next-line -->
            <ExternalLink :href="'mailto:' + email + '?subject=A question about your Gift Aid declaration'"><v-icon icon="envelope" />&nbsp;{{ email
              }}</ExternalLink>
          </div>
          <NoticeMessage v-if="editgiftaid.donations" variant="info">
            Total donations &pound;{{ editgiftaid.donations }}
          </NoticeMessage>
          <NoticeMessage v-else variant="danger">
            No donations found - please ask what donation method they used and
            if their donation was made using a different email address. If so
            then you need to add that as a secondary email address on their
            account using Support Tools.
          </NoticeMessage>
          <span class="small text-muted">
            {{ timeago(editgiftaid.timestamp) }}
            User ID <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
              editgiftaid.userid
            }}
            Gift Aid ID
            <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
              editgiftaid.id
            }}
          </span>
        </div>
      </b-col>
      <b-col cols="6" md="5">
        <b-form-textarea v-model="editgiftaid.homeaddress" rows="4" />
        <b-form-input
          v-model="editgiftaid.housenameornumber"
          :class="{ 'border-danger': houseInvalid, 'mt-1': true }"
          placeholder="House name or number"
        />
        <b-form-input
          v-model="editgiftaid.postcode"
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
            houseInvalid ||
            postcodeInvalid ||
            nameInvalid ||
            !editgiftaid.donations
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
      editgiftaid: false,
      hide: false,
    }
  },
  computed: {
    nameInvalid() {
      if (!this.editgiftaid) return false
      return this.editgiftaid?.fullname.indexOf(' ') === -1
    },
    postcodeInvalid() {
      if (!this.editgiftaid) return false
      return (
        !this.editgiftaid?.postcode ||
        this.editgiftaid?.postcode.indexOf(' ') === -1
      )
    },
    houseInvalid() {
      if (!this.editgiftaid) return false
      return !this.editgiftaid?.housenameornumber
    },
    email() {
      let email = null
      if (!this.editgiftaid) return email

      if (this.editgiftaid?.email) {
        this.editgiftaid.email.forEach((e) => {
          if (!e.ourdomain && (e.preferred || email === null)) {
            email = e.email
          }
        })
      }

      return email
    },
  },
  mounted() {
    this.editgiftaid = this.giftaid
  },
  methods: {
    save(callback) {
      const { id, period, fullname, homeaddress, postcode, housenameornumber } =
        this.editgiftaid
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
        this.editgiftaid.id,
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
      if (!this.editgiftaid.donations) {
        // Approve these as a way of getting them off the list even though they're not linked to a donation.
        this.reviewed()
      } else {
        this.$api.giftaid.edit(
          this.editgiftaid.id,
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
