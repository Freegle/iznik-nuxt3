export function useHelpBox() {
  const showHelp = ref(true)

  onMounted(() => {
    show()
  })

  function show() {
    showHelp.value = true
  }

  function hide() {
    showHelp.value = false
  }

  function toggleHelp() {
    if (showHelp.value) {
      hide()
    } else {
      show()
    }
  }

  return { show, hide, showHelp, toggleHelp }
}
