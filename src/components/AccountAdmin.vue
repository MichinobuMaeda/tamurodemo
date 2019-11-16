<template>
  <div class="row">
    <div class="col q-pa-md">
      <div class="row" v-if="account.id !== $store.state.me.id">
        <div class="col col-xs-4 col-sm-2 q-pa-md">
          <q-btn :label="$t('invitation')" color="primary" @click="invite" />
        </div>
        <div class="col col-xs-8 col-sm-10 q-px-md">
        <q-input v-model="account.invitationURL" readonly v-if="account.invitationURL"/>
        </div>
      </div>
      <q-list bordered separator>
        <q-item>
          <q-item-section>
            {{ $t('accountInvited') }}
          </q-item-section>
          <q-item-section>
            {{ longTimestamp(account.data().invitedAt.seconds * 1000) }}
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t('accountEntered') }}
          </q-item-section>
          <q-item-section>
            {{ longTimestamp(account.data().enteredAt.seconds * 1000) }}
          </q-item-section>
        </q-item>
        <q-item>
          <q-item-section>
            {{ $t('accountPaused') }}
          </q-item-section>
          <q-item-section>
            <q-toggle
              v-model="paused"
              :label="paused ? 'Yes' : 'No'"
              @input="toggleValid"
              v-if="account.id !== $store.state.me.id"
            />
            <span v-else>
              {{ paused ? 'Yes' : 'No' }}
            </span>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: [ 'account' ],
  data () {
    return {
      paused: !this.account.data().valid
    }
  },
  methods: {
    async invite () {
      const id = this.account.id
      let result = await this.$store.state.firebase.functions().httpsCallable('getInvitationUrl')({ id })
      this.account.invitationURL = result.data.url
      this.$forceUpdate()
    },
    async toggleValid () {
      const id = this.account.id
      await this.$store.state.db.collection('accounts').doc(id).update({
        valid: !this.account.data().valid
      })
    }
  },
  computed: {
    ...mapGetters([
      'conf',
      'longTimestamp'
    ])
  }
}
</script>
