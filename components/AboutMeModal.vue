<template>
  <b-modal
    id="aboutmemodal"
    v-model="show"
    scrollable
    :title="
      !review
        ? 'Why not complete your public profile?'
        : 'Please review your public profile'
    "
    size="lg"
    no-stacking
    no-fade
  >
    <template #default>
      <notice-message v-if="review" type="info">
        You added this a while ago - can you just check it still applies? If it
        does, just click <em>Cancel</em>. If you want to change it, edit it and
        click <em>Save</em>.
      </notice-message>
      <p>
        It's nice to know a bit about other freeglers. We're not a dating site
        but it makes freegling more fun and helps get a better response when
        you're replying to OFFERs.
      </p>
      <p>
        <strong>Don't put anything private in here.</strong>
        It's public, and it's what everyone on Freegle will see about you. We'll
        post it on <em>ChitChat</em> as a way to say hello to everyone, too.
      </p>
      <p>
        It's up to you what you say - why you freegle, general arrangements for
        collection, hobbies. It'll be visible until you change it in
        <em>Settings</em>, so write something that'll still make sense in a few
        months time!
      </p>
      <p>
        If you don't want to do this, that's fine - just click <em>Cancel</em>.
      </p>
      <b-form-textarea
        v-model="text"
        placeholder="Tell us a bit about yourself!"
        rows="8"
      />
      <notice-message variant="info" class="mt-2">
        <v-icon icon="globe-europe" /> Other freeglers will see what you put
        here, in your profile and on ChitChat. That's the point!
      </notice-message>
    </template>
    <template #footer>
      <b-button variant="white" @click="show = false"> Cancel </b-button>
      <b-button variant="primary" @click="save"> Save </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import NoticeMessage from './NoticeMessage'
import { useModal } from '~/composables/useModal'

const authStore = useAuthStore()

const props = defineProps({
  review: { type: Boolean, required: false, default: false },
})

const { show } = useModal(props)

const text = ref(null)

async function save() {
  await authStore.saveAboutMe(this.text)
  this.$emit('datachange')
  this.show = false
}
</script>
