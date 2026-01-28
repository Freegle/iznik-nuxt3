<template>
  <div>
    <ModHelpSpammers />
    <div>
      <div>
        <b-tabs v-model="tabIndex" content-class="mt-3" card lazy>
          <b-tab id="Spammers" :active="!hasPermissionSpamAdmin">
            <template #title>
              <h2 class="ml-2 mr-2">Confirmed Spammers</h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="PendingAdd">
            <template #title>
              <h2 class="ml-2 mr-2">
                Pending Add
                <b-badge v-if="pendingaddcount" variant="danger">
                  {{ pendingaddcount }}
                </b-badge>
              </h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="Safelisted">
            <template #title>
              <h2 class="ml-2 mr-2">Safelisted</h2>
            </template>
          </b-tab>
          <b-tab v-if="hasPermissionSpamAdmin" id="PendingRemove">
            <template #title>
              <h2 class="ml-2 mr-2">
                Pending Remove
                <b-badge v-if="pendingremovecount" variant="danger">
                  {{ pendingremovecount }}
                </b-badge>
              </h2>
            </template>
          </b-tab>
        </b-tabs>
        <p v-if="tabIndex === 0" spam class="p-2">
          To remove from spammer list, please mail geeks.
        </p>
        <p v-if="tabIndex === 2" spam class="p-2">
          To remove from safe list, please mail geeks.
        </p>
        <ModMemberSearchbox
          v-if="tabIndex === 0"
          spam
          class="mb-2"
          @search="searched"
        />
        <ModMember
          v-for="(spammer, index) in visibleSpammers"
          :key="'spammer-' + tabIndex + '-' + spammer.id"
          :member="spammer.user"
          :sameip="spammer.sameip"
          class="mb-1"
          :index="index"
        />
        <infinite-loading
          :distance="10"
          :identifier="infiniteId"
          @infinite="loadMore"
        >
          <template #spinner>
            <b-img lazy src="/loader.gif" alt="Loading" />
          </template>
        </infinite-loading>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useSpammerStore } from '~/stores/spammer'
import { useModMe } from '~/composables/useModMe'

const route = useRoute()
const authStore = useAuthStore()
const spammerStore = useSpammerStore()
const { hasPermissionSpamAdmin } = useModMe()

// Reactive state (was data())
const infiniteId = ref(0)
const tabIndex = ref(0)
const show = ref(0)
const busy = ref(false)
const search = ref(null)

// Computed properties
const pendingaddcount = computed(() => {
  return authStore.work ? authStore.work.spammerpendingadd : 0
})

const pendingremovecount = computed(() => {
  return authStore.work ? authStore.work.spammerpendingremove : 0
})

const collection = computed(() => {
  let ret = null

  switch (tabIndex.value) {
    case 0: {
      ret = 'Spammer'
      break
    }
    case 1: {
      ret = 'PendingAdd'
      break
    }
    case 2: {
      ret = 'Whitelisted'
      break
    }
    case 3: {
      ret = 'PendingRemove'
      break
    }
  }

  console.log('Spammer collection', tabIndex.value, ret)
  return ret
})

const spammers = computed(() => {
  const ret = spammerStore.getList(collection.value)

  // Need to move the byuser into the spammer object so that ModSpammer finds it.
  ret.forEach((s) => {
    s.user.spammer.byuser = s.byuser
  })

  return ret
})

const visibleSpammers = computed(() => {
  return spammers.value ? spammers.value.slice(0, show.value) : []
})

// Watchers
watch(tabIndex, () => {
  spammerStore.clear()
  infiniteId.value++
})

watch(
  () => route.path,
  () => {
    // Clear store when we move away to prevent items showing again when we come back on potentially a different tab.
    spammerStore.clear()
  }
)

// Methods
function searched(term) {
  spammerStore.clear()
  search.value = term
  infiniteId.value++
}

async function loadMore($state) {
  busy.value = true

  if (show.value < spammers.value.length) {
    // This means that we will gradually add the members that we have fetched from the server into the DOM.
    // Doing that means that we will complete our initial render more rapidly and thus appear faster.
    show.value++
    $state.loaded()
    busy.value = false
  } else {
    const currentCount = spammers.value.length
    await spammerStore.fetch({
      collection: collection.value,
      search: search.value,
      modtools: true,
    })

    if (currentCount === spammers.value.length) {
      busy.value = false
      $state.complete()
    } else {
      $state.loaded()
      busy.value = false
      show.value++
    }
  }
}

// Lifecycle - mounted
onMounted(() => {
  // Start in Pending Add if they have rights to see it.
  spammerStore.clear()

  if (hasPermissionSpamAdmin.value) {
    if (search.value) {
      tabIndex.value = 0
    } else {
      tabIndex.value = 1
    }
  } else {
    tabIndex.value = 0
  }
})
</script>
