<template>
  <b-modal
    ref="modal"
    scrollable
    :title="
      !props.review
        ? 'Why not complete your public profile?'
        : 'Please review your public profile'
    "
    size="lg"
    no-stacking
  >
    <template #default>
      <notice-message v-if="props.review" type="info">
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
        <strong>This is just about you generally</strong>. To give something
        away, or ask for something you need, please use these buttons:
      </p>
      <div class="d-flex flex-wrap justify-content-start mb-2">
        <b-button to="/give" variant="primary" class="m-1 mr-4"
          >Give something</b-button
        >
        <b-button to="/find" variant="secondary" class="m-1"
          >Ask for something</b-button
        >
      </div>
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
      <b-button variant="white" @click="hide"> Cancel </b-button>
      <b-button variant="primary" @click="save"> Save </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import NoticeMessage from './NoticeMessage'
import { useAuthStore } from '~/stores/auth'
import { useOurModal } from '~/composables/useOurModal'

const authStore = useAuthStore()

const props = defineProps({
  review: { type: Boolean, required: false, default: false },
})

const emit = defineEmits(['dataChange'])

const { modal, hide } = useOurModal()

const text = ref(authStore.user.aboutme.text)

async function save() {
  await authStore.saveAboutMe(text.value)
  emit('dataChange')
  hide()
}
</script>
