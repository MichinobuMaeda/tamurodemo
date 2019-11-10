<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-icon name="people" />
        {{ $t('groups') }}
      </p>
      <q-list bordered separator>
        <q-item clickable v-ripple to="/groups/top">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>{{ group('top').data().name }}</q-item-section>
        </q-item>
        <div v-for="group in $store.state.groups" v-bind:key="group.id">
          <q-item
            v-if="!['top', 'manager', 'admin'].includes(group.id)"
            clickable v-ripple :to="'/groups/' + group.id"
          >
            <q-item-section avatar><q-icon name="people" /></q-item-section>
            <q-item-section>{{ group.data().name }}</q-item-section>
          </q-item>
        </div>
        <q-item clickable v-ripple to="/groups/manager">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>{{ group('manager').data().name }}</q-item-section>
        </q-item>
        <q-item clickable v-ripple to="/groups/admin">
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>{{ group('admin').data().name }}</q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'PageIndex',
  computed: {
    ...mapGetters([
      'conf',
      'group'
    ])
  }
}
</script>
