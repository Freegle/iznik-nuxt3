function waitForRefTimer(ref, resolve) {
  if (ref) {
    console.log('waitForRefTimer ref')
    if (ref.value) {
      console.log('waitForRefTimer ref.value')
      resolve(ref.value)
    } else {
      console.log('waitForRefTimer setTimeout')
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
    console.log('waitForRef start')
    waitForRefTimer(ref, resolve)
  })
}
