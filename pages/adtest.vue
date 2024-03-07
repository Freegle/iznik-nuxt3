<template>
  <client-only>
    <b-container fluid class="p-0 p-xl-2">
      <h1 class="visually-hidden">Ad Test page</h1>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1">
          <VisibleWhen
            :not="['xs', 'sm', 'md', 'lg']"
            class="position-fixed"
            style="width: 300px"
          >
            <ExternalDa
              ad-unit-path="/22794232631/freegle_home_left"
              :dimensions="[
                [300, 600],
                [300, 250],
              ]"
              div-id="div-gpt-ad-1691925450433-0"
              class="mt-2"
            />
          </VisibleWhen>
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          This is a test page for ads.
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1">
          <div class="d-flex justify-content-end">
            <VisibleWhen
              :not="['xs', 'sm', 'md', 'lg']"
              class="position-fixed"
              style="right: 5px"
            >
              <ExternalDa
                ad-unit-path="/22794232631/freegle_home"
                :dimensions="[
                  [300, 600],
                  [300, 250],
                ]"
                div-id="div-gpt-ad-1691925450433-1"
                class="mt-2"
              />
            </VisibleWhen>
          </div>
        </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script>
import VisibleWhen from '~/components/VisibleWhen'

export default {
  components: {
    VisibleWhen,
  },
}
</script>
