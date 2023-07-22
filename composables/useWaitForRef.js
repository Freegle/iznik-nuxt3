function waitForRefTimer(ref, resolve) {
  if (ref) {
    if (ref.value) {
      resolve(ref.value)
    } else {
      setTimeout(() => {
        waitForRefTimer(ref, resolve)
      }, 100)
    }
  }
}

export function waitForRef(ref) {
  // When a component is conditional using a v-if, it sometimes takes more than one tick for it to appear.  So
  // we have a bit of a timer.
  return new Promise((resolve) => {
    waitForRefTimer(ref, resolve)
  })
}
