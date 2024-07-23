<template>
  <div>
    <div v-if="!contactsAvailable" class="layout">
      <div>
        <b-button variant="primary" size="lg" @click="getContacts">
          Invite your friends!
        </b-button>
      </div>
      <div class="d-flex flex-column justify-content-center">
        <p class="small m-0">
          It'll ask for access to your contacts. <strong>Don't worry</strong> -
          this doesn't mean we can access all of them! You choose which ones to
          invite. We don't pass this information to our servers, we don't store
          it, and we can't access it in future. You're in control.
        </p>
      </div>
    </div>
    <div v-else>
      <label for="invitation" class="font-weight-bold">
        Personalise your invitation message:
      </label>
      <b-form-textarea
        id="invitation"
        v-model="invitation"
        maxlength="160"
        rows="3"
        size="lg"
        placeholder="Tell your friends why they should get freegling!"
        class="mt-2 mb-2 border border-primary"
      />
      <div v-if="phones.length">
        <component :is="headingLevel" class="mt-2">
          Invite by WhatsApp
        </component>
        <ExternalLink
          v-for="phone in phones"
          :key="'phone-' + phone.phone"
          :href="
            'whatsapp://send?phone=' +
            phone.phone +
            '&text=' +
            encodeURIComponent(invitation)
          "
          @click="chosen"
        >
          <b-button variant="primary" class="mb-1 mr-1">
            <v-icon :icon="['fab', 'whatsapp']" /> {{ phone.name }}
            <span class="small"
              ><span class="small">{{ phone.phone }}</span></span
            >
          </b-button>
        </ExternalLink>
        <component :is="headingLevel" class="mt-2">
          Invite by text (SMS)
        </component>
        <ExternalLink
          v-for="phone in phones"
          :key="'sms-' + phone.phone"
          :href="
            'sms://' + phone.phone + ';?&body=' + encodeURIComponent(invitation)
          "
          @click="chosen"
        >
          <b-button variant="primary" class="mb-1 mr-1">
            <v-icon icon="sms" /> {{ phone.name }}
            <span class="small"
              ><span class="small">{{ phone.phone }}</span></span
            >
          </b-button>
        </ExternalLink>
      </div>
      <div v-if="emails.length">
        <component :is="headingLevel" class="mt-2"> Invite by email </component>
        <ExternalLink
          v-for="email in emails"
          :key="'email-' + email"
          :href="
            'mailto:' +
            email.email +
            '?subject=Have you tried Freegle%3F&body=' +
            encodeURIComponent(invitation)
          "
          class="mb-1 mr-1"
          @click="chosen"
        >
          <b-button variant="primary">
            <v-icon icon="envelope" /> {{ email.email }}
          </b-button>
        </ExternalLink>
      </div>
    </div>
  </div>
</template>
<script>
import ExternalLink from './ExternalLink'

export default {
  components: { ExternalLink },
  props: {
    headingLevel: {
      type: String,
      required: false,
      default: 'h3',
    },
    trustPilot: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      contacts: null,
      invitation:
        "Hi - I'm using Freegle to give and get things for free.  Check it out at https://www.ilovefreegle.org",
    }
  },
  computed: {
    contactsAvailable() {
      return this.contacts?.length
    },
    emails() {
      const ret = []

      if (this.contacts) {
        this.contacts.forEach((c) => {
          if (c.email) {
            c.email.forEach((e) => {
              ret.push({
                name: c.name ? c.name[0] : null,
                email: e,
              })
            })
          }
        })
      }

      return ret
    },
    phones() {
      const ret = []

      if (this.contacts) {
        this.contacts.forEach((c) => {
          if (c.tel) {
            c.tel.forEach((e) => {
              // Fix up the formatting a bit, particular for IOS which is picky.
              let phoneno = e.replace(/\s+/g, '')

              if (phoneno.length > 1) {
                if (phoneno.charAt(0) === '0' && phoneno.charAt(1) !== '0') {
                  // Convert to UK prefix.
                  phoneno = '+44' + phoneno.substring(1)
                }
              }

              // Ignore dups.
              if (!ret.find((p) => p.phone === phoneno)) {
                ret.push({
                  name: c.name ? c.name[0] : null,
                  phone: phoneno,
                })
              }
            })
          }
        })
      }

      return ret
    },
  },
  mounted() {
    this.$api.bandit.shown({
      uid: 'Invite',
      variant: 'microvolunteering',
    })
  },
  methods: {
    chosen() {
      this.$emit('invited')

      this.$api.bandit.chosen({
        uid: 'Invite',
        variant: 'microvolunteering',
      })
    },
    async getContacts() {
      this.chosen()

      this.contacts = await navigator.contacts.select(
        ['name', 'email', 'tel'],
        {
          multiple: true,
        }
      )
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto;
  grid-row-gap: 20px;
  grid-column-gap: 10px;

  @include media-breakpoint-up(md) {
    grid-template-columns: auto auto;
    grid-column-gap: 20px;
    grid-template-rows: auto;
    grid-row-gap: 0px;
  }
}
</style>
