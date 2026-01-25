# Pinia 3.0 Upgrade Warning

## DO NOT upgrade to Pinia 3.0 without careful testing

**Date:** October 30, 2025
**Issue:** Pinia 3.0 has breaking API changes that cause initialization errors

### What Happened

ModTools was accidentally upgraded to:
- `pinia@3.0.3`
- `@pinia/nuxt@0.11.2`

This caused a runtime error:
```
TypeError: Cannot destructure property 'state' of 'options' as it is undefined.
    at createOptionsStore (pinia.mjs:1227:13)
```

### Root Cause

Pinia 3.0 changed the `defineStore` API:

**Old syntax (Pinia 2.x):**
```javascript
export const useAuthStore = defineStore({
  id: 'auth',
  persist: { ... },
  state: () => ({ ... })
})
```

**New syntax (Pinia 3.x):**
```javascript
export const useAuthStore = defineStore('auth', {
  persist: { ... },
  state: () => ({ ... })
})
```

### Current Working Versions

Both FreegleDockerWSL projects should use:
- `pinia@^2.0.17` (installs 2.3.1)
- `@pinia/nuxt@^0.9.0`

### Before Upgrading to Pinia 3.0

1. **Update ALL store definitions** to use the new syntax
2. Search for `defineStore({` and change to `defineStore('storeName', {`
3. Test thoroughly on both Freegle and ModTools
4. Check for any other breaking changes in the [Pinia 3.0 migration guide](https://pinia.vuejs.org/cookbook/migration-v2-v3.html)

### Files to Check

All store files in both projects:
- `iznik-nuxt3/stores/*.js`
- `iznik-nuxt3-modtools/stores/*.js`

There are 30+ store files in each project that would need updating.
