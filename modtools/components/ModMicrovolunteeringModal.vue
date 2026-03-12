<template>
  <div>
    <client-only>
      <b-modal
        id="aboutmemodal"
        ref="modal"
        :title="
          'Microvolunteering for ' + (user ? user.displayname : '#' + userid)
        "
        size="xl"
      >
        <template #default>
          <div v-for="item in itemIds" :key="'item-' + item" class="p-0 mt-2">
            <ModMicrovolunteering :id="item" />
          </div>
        </template>
        <template #footer>
          <b-button variant="white" @click="hide"> Cancel </b-button>
        </template>
      </b-modal>
    </client-only>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
import { useOurModal } from '~/composables/useOurModal'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  itemIds: {
    type: Array,
    required: true,
  },
})

const userStore = useUserStore()
const user = computed(() => userStore.byId(props.userid))

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) userStore.fetch(uid)
  },
  { immediate: true }
)

const { modal, hide, show } = useOurModal()

defineExpose({ show, hide })
</script>
