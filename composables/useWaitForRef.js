export function waitForRef(ref, callback) {
  // When a component is conditional using a v-if, it sometimes takes more than one tick for it to appear.  So
  // we have a bit of a timer.
  if (ref.value) {
    callback()
  } else {
    setTimeout(() => {
      waitForRef(ref, callback)
    }, 100)
  }
}
