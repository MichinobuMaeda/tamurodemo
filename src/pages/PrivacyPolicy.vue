<template>
  <q-page class="row justify-center">
    <div :class="conf.styles.col1">
      <p :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconPrivacyPolicy" />
        {{ $t('privacyPolicy') }}
      </p>
      <q-form ref="main" v-if="edit">
        <q-input outlined type="textarea" v-model="desc" />
        <q-btn class="q-ma-md" color="primary" :label="$t('save')" @click="savePolicy" />
        <q-btn class="q-ma-md" :label="$t('cancel')" @click="edit = false" />
      </q-form>
      <div v-else>
        <q-btn
          v-if="isManager"
          flat round dense :color="conf.styles.headerText" class="q-mr-sm float-right"
          :icon="conf.styles.iconEdit"
          @click="editPolicy"
        />
        <VueMarkdown>{{ $store.state.service.conf.privacyPolicy }}</VueMarkdown>
      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
import { mapGetters } from 'vuex'
import VueMarkdown from 'vue-markdown'

export default {
  name: 'PagePrivacyPolicy',
  components: {
    VueMarkdown
  },
  data () {
    return {
      edit: false,
      desc: ''
    }
  },
  methods: {
    editPolicy () {
      this.desc = this.$store.state.service.conf.privacyPolicy
      this.edit = true
    },
    async savePolicy () {
      this.edit = false
      this.desc = this.desc.trim()
      await this.$store.state.db.collection('service').doc('conf').update({
        privacyPolicy: this.desc
      })
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'isManager'
    ])
  }
}
</script>
