<template>
  <div>
    <SpinButton
      v-if="!gotallgroups"
      variant="primary"
      icon-name="refresh"
      label="Fetch communities"
      spinclass="text-white"
      @handle="loadallgroups"
    />
    <div v-if="gotallgroups">
      <label>From:</label>
      <b-form-select v-model="from">
        <option value="null">-- Please choose --</option>
        <option value="info">info@...</option>
        <option value="support">support@...</option>
        <option value="councils">councils@...</option>
        <option value="mentors">mentors@...</option>
        <option value="newgroups">newgroups@...</option>
        <option value="geeks">geeks@...</option>
        <option value="board">board@...</option>
        <option value="ro">returningofficer@...</option>
        <option value="volunteers">volunteers@...</option>
        <option value="centralmods">volunteersupport@...</option>
      </b-form-select>
      <label> To: </label>
      <ModGroupSelect v-model="groupid" systemwide listall />
      <NoticeMessage v-if="groupid < 0" variant="danger" class="mt-2 mb-2">
        This will go to all groups.
      </NoticeMessage>
      <label> Try hard? </label>
      <b-form-select v-model="tryhard">
        <option :value="false">Just mail primary email</option>
        <option :value="true">Mail all email addresses we know</option>
      </b-form-select>
      <label> Confirm receipt </label>
      <b-form-select v-model="confirm">
        <option :value="false">Don't ask to click</option>
        <option :value="true">Ask them to click to confirm receipt</option>
      </b-form-select>
      <label>Subject</label>
      <b-form-input
        v-model="subject"
        placeholder="Brief subject of this message"
      />
      <label>Text version</label>
      <b-form-textarea v-model="text" rows="6" />
      <label>HTML version (optional)</label>
      <client-only>
        <div class="bg-white">
          <QuillEditor
            v-model:content="html"
            :modules="quillModules"
            theme="snow"
            :toolbar="toolbarOptions"
            content-type="html"
            class="bg-white"
          />
        </div>
      </client-only>
      <NoticeMessage v-if="groupid < 0" variant="danger" class="mt-2 mb-2">
        This will go to all groups.
      </NoticeMessage>
      <SpinButton
        v-if="groupid < 0"
        variant="danger"
        label="Send to all groups"
        icon-name="envelope"
        spinclass="text-white"
        :disabled="!valid"
        class="mt-2 mb-2"
        size="lg"
        @handle="send"
      />
      <SpinButton
        v-else
        variant="primary"
        label="Send"
        icon-name="envelope"
        spinclass="text-white"
        :disabled="!valid"
        class="mt-2 mb-2"
        size="lg"
        @handle="send"
      />
      <div v-if="alerts && alerts.length">
        <b-row class="font-weight-bold">
          <b-col cols="6" lg="2"> Created </b-col>
          <b-col cols="6" lg="2"> Complete </b-col>
          <b-col cols="6" lg="2"> To </b-col>
          <b-col cols="6" lg="4"> Subject </b-col>
          <b-col cols="6" lg="2" />
        </b-row>
        <ModAlertHistory
          v-for="alert in alerts"
          :key="'alert-' + alert.id"
          :alert="alert"
        />
      </div>
      <Spinner v-else-if="busy" :size="50" class="d-block" />
      <b-button
        v-else
        variant="white"
        size="lg"
        class="mt-2 mb-2 d-block"
        @click="fetch"
      >
        Show history
      </b-button>
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import htmlEditButton from 'quill-html-edit-button'

import ModAlertHistory from './ModAlertHistory'
import { useAlertStore } from '~/stores/alert'
import { useModGroupStore } from '~/stores/modgroup'

const alertStore = useAlertStore()
const modGroupStore = useModGroupStore()

const quillModules = {
  name: 'htmlEditButton',
  module: htmlEditButton,
  options: {},
}

const busy = ref(false)
const from = ref(null)
const groupid = ref(null)
const tryhard = ref(false)
const confirm = ref(false)
const subject = ref(null)
const text = ref(null)
const html = ref(null)

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ color: [] }, { background: [] }],
  ['link', 'image', 'video'],
  ['clean'],
]

const gotallgroups = computed(() => {
  return Object.values(modGroupStore.allGroups).length > 0
})

const valid = computed(() => {
  return from.value && subject.value && text.value && groupid.value
})

const alerts = computed(() => {
  const alertList = Object.values(alertStore.list)
  alertList.sort(function (a, b) {
    return new Date(b.created).getTime() - new Date(a.created).getTime()
  })
  return alertList
})

async function loadallgroups(callback) {
  await modGroupStore.listMT({ grouptype: 'Freegle' })
  callback()
}

async function send(callback) {
  const data = {
    from: from.value,
    subject: subject.value,
    text: text.value,
    html: html.value,
    askclick: confirm.value ? 1 : 0,
    tryhard: tryhard.value ? 1 : 0,
  }

  if (groupid.value > 0) {
    data.groupid = groupid.value
  } else {
    data.groupid = 'AllFreegle'
  }

  await alertStore.add(data)
  callback()
}

async function fetch() {
  busy.value = true

  await alertStore.fetch()

  busy.value = false
}
</script>
<style scoped>
label {
  font-weight: bold;
}

select {
  max-width: 400px;
  display: block;
}
</style>
