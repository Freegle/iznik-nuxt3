<template>
  <client-only>
    <div class="layout fader">
      <div class="d-none d-md-flex justify-content-around">
        <WizardProgress :active-stage="1" class="maxbutt" />
      </div>
      <b-row class="m-0">
        <b-col cols="12" lg="8" class="p-0 layout fader" offset-lg="2">
          <h1 class="text-center">First, what are you looking for?</h1>
          <ul
            v-for="(id, index) in ids"
            :key="'post-' + id"
            class="p-0 pt-1 list-unstyled"
          >
            <li class="p-0">
              <b-card no-body>
                <b-card-body class="p-1" sub-title="">
                  <PostMessage :id="id" type="Wanted" />
                </b-card-body>
                <b-card-footer
                  v-if="index === ids.length - 1"
                  class="d-flex justify-content-between p-0 pt-1 bg-transparent border-top-0"
                >
                  <b-button
                    v-if="ids.length === 1 && notblank"
                    variant="link"
                    size="sm"
                    class="mr-1"
                    @click="deleteItem(id)"
                  >
                    <v-icon icon="trash-alt" />&nbsp;Clear form
                  </b-button>
                  <div>
                    <b-button
                      v-if="ids.length > 1"
                      variant="link"
                      size="sm"
                      class="mr-1"
                      @click="deleteItem(id)"
                    >
                      <v-icon icon="trash-alt" />&nbsp;Delete last item
                    </b-button>
                    <b-button
                      v-if="ids.length < 6 && messageValid"
                      variant="secondary"
                      size="sm"
                      class="mb-1 mr-1"
                      @click="addItem"
                    >
                      <v-icon icon="plus" />&nbsp;Add another item
                    </b-button>
                  </div>
                </b-card-footer>
              </b-card>
            </li>
          </ul>
          <div class="d-block d-md-none flex-grow-1" />
          <div class="mt-1 d-block d-md-none">
            <b-button
              variant="primary"
              :disabled="uploadingPhoto"
              size="lg"
              block
              to="/find/whereami"
              class="w-100"
            >
              Next <v-icon icon="angle-double-right" />
            </b-button>
          </div>
          <div class="w-100 mt-3 mb-5 d-none d-md-flex justify-content-end">
            <div v-if="messageValid">
              <div class="mb-2">
                <b-button
                  variant="primary"
                  size="lg"
                  :disabled="uploadingPhoto"
                  to="/find/whereami"
                >
                  Next <v-icon icon="angle-double-right" />
                </b-button>
              </div>
            </div>
            <NoticeMessage v-else variant="info mt-1 mb-1">
              Please add the item name, and a description or photo (or both).
            </NoticeMessage>
          </div>
        </b-col>
      </b-row>
    </div>
  </client-only>
</template>
<script>
import { useRoute } from 'vue-router'
import { buildHead } from '../../composables/useBuildHead'
import NoticeMessage from '~/components/NoticeMessage'
import { setup, deleteItem, addItem } from '~/composables/useCompose'

import PostMessage from '~/components/PostMessage'
import WizardProgress from '~/components/WizardProgress'

export default {
  components: {
    NoticeMessage,
    PostMessage,
    WizardProgress,
  },
  async setup() {
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'WANTED',
        "Ask people nearby if they have what you're looking for"
      )
    )

    return await setup('Wanted')
  },
  methods: {
    deleteItem,
    addItem,
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.cg {
  flex-basis: 25%;
  flex-grow: 1;
}

.maxbutt {
  width: 33vw;
}

@include media-breakpoint-down(md) {
  .layout {
    //We need to subtract space for the navbar, the ad bar, and also allow some extra because of the way vh works
    //mobile browsers.
    min-height: calc(100vh - 84px - 52px - 84px);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
</style>
