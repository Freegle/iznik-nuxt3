<template>
  <b-card v-if="show && message && group" no-body>
    <b-card-header>
      <div class="d-flex justify-content-between">
        <div>Share to community Facebook pages</div>
        <div class="small text-muted">
          {{ timeago(item.date) }}
        </div>
      </div>
    </b-card-header>
    <!-- eslint-disable-next-line-->
    <b-card-body>
      <p class="small text-muted">
        This will share a popular post to Facebook so that people there who
        aren't on Freegle see things that are appealing.
      </p>
      <p>
        FREE! Here’s the sort of thing that has been freegled on
        {{ group.namedisplay }}:
      </p>
      <p>
        {{ message.subject }}
      </p>
      <p>
        Hop over to &lt;shortlink will be automatically inserted here&gt; to see
        what else is being given away, or to ask for stuff you'd like.
      </p>
      <ModMessageSummary
        :id="message.id"
        :replyable="false"
        :message="message"
      />
    </b-card-body>
    <b-card-footer>
      <SpinButton
        variant="white"
        icon-name="share-alt"
        :label="'Share on ' + group.namedisplay"
        class="mt-1 mb-1"
        @handle="share"
      />
      <SpinButton
        variant="white"
        icon-name="trash-alt"
        :label="'Hide for ' + group.namedisplay"
        class="mt-1 mb-1"
        @handle="hide"
      />
    </b-card-footer>
  </b-card>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'
import { usePublicityStore } from '@/stores/publicity'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const groupStore = useGroupStore()
const messageStore = useMessageStore()
const publicityStore = usePublicityStore()

const show = ref(true)

const message = computed(() => {
  return messageStore.byId(props.item.msgid)
})

const group = computed(() => {
  return groupStore.get(props.item.groupid)
})

onMounted(() => {
  messageStore.fetch(props.item.msgid)
  groupStore.fetch(props.item.groupid)
})

async function share() {
  await publicityStore.sharePopularPost({
    groupid: props.item.groupid,
    msgid: props.item.msgid,
  })

  show.value = false
}

async function hide() {
  await publicityStore.hidePopularPost({
    groupid: props.item.groupid,
    msgid: props.item.msgid,
  })

  show.value = false
}
</script>
