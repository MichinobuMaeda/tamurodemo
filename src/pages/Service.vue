<template>
  <q-page class="row">
    <div class="col q-pa-md">
      <p :class="conf.styles.pageTitle">
        <q-icon name="cloud_circle" />
        Service
      </p>

      <div class="row">
        <div class="col q-pa-md col-xs-12 col-sm-6 col-md-4 col-lg-4">
          <div class="text-h6 text-secondary">Version</div>
          <q-markup-table class="q-my-sm">
            <thead>
              <tr>
                <th>Service</th>
                <th>Software</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="text-center"><code>{{ $store.state.service.status.version }}</code></td>
                <td class="text-center"><code>{{ conf.version }}</code></td>
              </tr>
            </tbody>
          </q-markup-table>
          <q-btn
            color="primary"
            icon="cloud_upload" label="Release"
            @click="releaseUiSoftware"
            :disable="version <= $store.state.service.status.version"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'PageService',
  data () {
    return {
    }
  },
  methods: {
    ...mapActions([ 'releaseUiSoftware' ])
  },
  computed: {
    ...mapGetters([
      'conf'
    ])
  }
}

</script>
