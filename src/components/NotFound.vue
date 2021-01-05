<template>
  <div>404 not found</div>
</template>

<script>
import { onMounted } from '@vue/composition-api'

export default {
  name: 'NotFound',
  setup (props, { root }) {
    onMounted(() => { root.$router.push('/').catch(() => {}) })
    return {}
  }
}
</script>
