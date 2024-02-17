<template>
  <div>
    <h1>Chat - {{ id }}</h1>
  </div>
</template>

<script setup>

const route = useRoute()
console.log('chats', route.params.id)
const id = route.params.id
/*const id = computed(() => {
  return  route.params.id
})*/

</script>
