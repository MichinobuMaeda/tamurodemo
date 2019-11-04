<template>
  <q-page class="row">
    <div class="col q-pa-sm">
      <div v-for="n in 100" :key="n">
        <p><router-link to="/policy">Privacy policy</router-link></p>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'PageIndex'
}
</script>
