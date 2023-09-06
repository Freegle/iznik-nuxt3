function waitForRefTimer(ref, prop, resolve) {
  if (ref) {
    if (ref.value && (!prop || ref.value[prop])) {
      resolve(ref.value)
    } else {
      setTimeout(() => {
        waitForRefTimer(ref, prop, resolve)
      }, 100)
    }
  }
}

export function waitForRef(ref, prop) {
  // When a component is conditional using a v-if, it sometimes takes more than one tick for it to appear.  So
  // we have a bit of a timer.
  return new Promise((resolve) => {
    waitForRefTimer(ref, prop, resolve)
  })
}
