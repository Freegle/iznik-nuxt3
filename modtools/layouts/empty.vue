<template>
  <client-only>
    <slot
      ref="pageContent"
      class="ml-0 pl-0 pl-sm-1 pr-0 pr-sm-1 pageContent empty"
    />
  </client-only>
</template>
<style scoped lang="scss">
html {
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}

svg.fa-icon {
  height: 32px;
}
</style>
