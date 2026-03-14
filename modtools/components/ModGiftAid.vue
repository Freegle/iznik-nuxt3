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
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'

const props = defineProps({
  giftaid: {
    type: Object,
    required: true,
  },
})

const { $api } = useNuxtApp()

const editgiftaid = ref(false)
const hide = ref(false)

const nameInvalid = computed(() => {
  if (!editgiftaid.value) return false
  return editgiftaid.value?.fullname.indexOf(' ') === -1
})

const postcodeInvalid = computed(() => {
  if (!editgiftaid.value) return false
  return (
    !editgiftaid.value?.postcode ||
    editgiftaid.value?.postcode.indexOf(' ') === -1
  )
})

const houseInvalid = computed(() => {
  if (!editgiftaid.value) return false
  return !editgiftaid.value?.housenameornumber
})

const email = computed(() => {
  let emailVal = null
  if (!editgiftaid.value) return emailVal

  if (editgiftaid.value?.email) {
    editgiftaid.value.email.forEach((e) => {
      if (!e.ourdomain && (e.preferred || emailVal === null)) {
        emailVal = e.email
      }
    })
  }

  return emailVal
})

function save(callback) {
  const { id, period, fullname, homeaddress, postcode, housenameornumber } =
    editgiftaid.value
  $api.giftaid.edit(
    id,
    period,
    fullname,
    homeaddress,
    postcode,
    housenameornumber,
    false
  )
  callback()
}

function reviewed(callback) {
  $api.giftaid.edit(editgiftaid.value.id, null, null, null, null, null, true)
  if (callback) callback()
  hide.value = true
}

function giveup(callback) {
  if (!editgiftaid.value.donations) {
    // Approve these as a way of getting them off the list even though they're not linked to a donation.
    reviewed()
  } else {
    $api.giftaid.edit(
      editgiftaid.value.id,
      null,
      null,
      null,
      null,
      null,
      false,
      true
    )
    hide.value = true
  }
  callback()
}

onMounted(() => {
  editgiftaid.value = props.giftaid
})
</script>
