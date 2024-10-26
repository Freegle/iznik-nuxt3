<template>
  <button
    ref="jgbutton"
    data-jg-donate-button
    data-linkid="fx6eedvc49"
    data-marketcode="GB"
    data-donatebuttontype="justgivingSmall"
    data-linktype="givingCheckout"
    data-popupcheckout="true"
    data-showpaymentlogos="false"
    class="jgbutton"
  >
    <b-img src="https://www.jg-cdn.com/buttons/donate-with-jg.svg" />
  </button>
</template>
<script setup>
const jgbutton = ref(null)

onMounted(() => {
  watch(
    jgbutton,
    (newVal) => {
      if (newVal) {
        console.log('Add JG script')
        const script = document.createElement('script')
        script.setAttribute('data-version', '2')
        script.setAttribute('data-widgetType', 'attachCheckout')

        script.setAttribute(
          'src',
          'https://www.justgiving.com/widgets/scripts/widget.js'
        )

        document.body.appendChild(script)
      }
    },
    {
      immediate: true,
      deep: true,
    }
  )
})
</script>
<style scoped lang="scss">
.jgbutton {
  background-color: #7a04dd;
}
</style>
