<template>
  <client-only>
    <b-container fluid class="p-0 p-xl-2 bg-white">
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
              div-id="div-gpt-ad-1693235056629-0"
              class="mt-2"
              show-logged-out
            />
          </VisibleWhen>
          <VisibleWhen :at="['lg', 'xl', 'xxl']">
            <SidebarLeft />
          </VisibleWhen>
        </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <p>
            This is a test page for ads. You should view this on desktop. There
            should be an ad on the left, on the right, and a sticky ad banner at
            the bottom. The ads should refresh.
          </p>
          <p>
            Ads on here will show when logged out - normally they don't,
            deliberately.
          </p>
          <p>
            To debug this page, you can add
            <em>?pbjs_debug=true&pubmaticTest=true</em>
            to the URL. This will produce output from prebid in the Developer
            Console, and will force Pubmatic to win the sticky footer ad auction
            showing a test ad.
          </p>
          <p>
            You should also see the AppNexus test ad here - this is triggered
            using a test placement id. It is a bit flaky so may only appear
            after 30s or so.
          </p>
          <ExternalDa
            ad-unit-path="/22794232631/appnexus_test"
            :dimensions="[
              [600, 500],
              [300, 600],
            ]"
            div-id="div-gpt-ad-appnexus-test-0"
            class="mt-2"
            show-logged-out
          />
          <!--          <p>You should also see a Magnite text ad here:</p>-->
          <!--          <ExternalDa-->
          <!--            ad-unit-path="/22794232631/freegle_chat_desktop"-->
          <!--            :dimensions="[-->
          <!--                [300, 600],-->
          <!--                [300, 250],-->
          <!--              ]"-->
          <!--            div-id="div-gpt-ad-1692867596111-0"-->
          <!--            class="mt-2"-->
          <!--          />-->
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
                div-id="div-gpt-ad-1691925450433-0"
                class="mt-2"
                show-logged-out
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
import ExternalDa from '~/components/ExternalDa.vue'

export default {
  components: {
    ExternalDa,
    VisibleWhen,
  },
}
</script>
