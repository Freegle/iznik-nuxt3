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
      <b-img v-else-if="busy" src="/loader.gif" alt="Loading" class="d-block" />
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
<script>
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import htmlEditButton from 'quill-html-edit-button'

import ModAlertHistory from './ModAlertHistory'
import { useAlertStore } from '~/stores/alert'
import { useModGroupStore } from '~/stores/modgroup'

/* let VueEditor, htmlEditButton

if (process.client) {
  const Quill = require('vue2-editor').Quill
  window.Quill = Quill
  htmlEditButton = require('quill-html-edit-button').htmlEditButton
  VueEditor = require('vue2-editor').VueEditor
  Quill.register('modules/htmlEditButton', htmlEditButton)
} */

export default {
  components: {
    ModAlertHistory,
    QuillEditor,
  },
  setup() {
    const alertStore = useAlertStore()
    const modGroupStore = useModGroupStore()
    const quillModules = {
      name: 'htmlEditButton',
      module: htmlEditButton,
      options: {}, // https://github.com/benwinding/quill-html-edit-button?tab=readme-ov-file#options
    }
    return { alertStore, modGroupStore, quillModules }
  },
  data: function () {
    return {
      busy: false,
      from: null,
      groupid: null,
      tryhard: false,
      confirm: false,
      subject: null,
      text: null,
      html: null,
      toolbarOptions: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ color: [] }, { background: [] }],
        ['link', 'image', 'video'],
        ['clean'],
      ],
    }
  },
  computed: {
    gotallgroups() {
      return Object.values(this.modGroupStore.allGroups).length > 0
    },
    valid() {
      return this.from && this.subject && this.text && this.groupid
    },
    alerts() {
      const alerts = Object.values(this.alertStore.list)
      alerts.sort(function (a, b) {
        return new Date(b.created).getTime() - new Date(a.created).getTime()
      })
      return alerts
    },
  },
  mounted() {
    // this.alertStore.clear()
  },
  methods: {
    async loadallgroups(callback) {
      await this.modGroupStore.listMT({ grouptype: 'Freegle' })
      callback()
    },
    async send(callback) {
      const data = {
        from: this.from,
        subject: this.subject,
        text: this.text,
        html: this.html,
        askclick: this.confirm ? 1 : 0,
        tryhard: this.tryhard ? 1 : 0,
      }

      if (this.groupid > 0) {
        data.groupid = this.groupid
      } else {
        data.groupid = 'AllFreegle'
      }

      await this.alertStore.add(data)
      callback()
    },
    async fetch() {
      this.busy = true

      await this.alertStore.fetch()

      this.busy = false
    },
  },
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
