<template>
  <div class="row">
    <div class="col q-pa-md">
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
            {{ account.data().valid ? 'No' : 'Yes' }}
          </q-item-section>
        </q-item>
      </q-list>
      <div class="row">
        <div class="col col-xs-4 col-sm-2 q-pa-md">
          <q-btn :label="$t('invitation')" color="primary" @click="invite(account.id)" />
        </div>
        <div class="col col-xs-8 col-sm-10 q-px-md">
        <q-input v-model="account.invitationURL" readonly v-if="account.invitationURL"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  props: [ 'account' ],
  methods: {
    async invite (id) {
      let result = await this.$store.state.firebase.functions().httpsCallable('getInvitationUrl')({ id })
      this.account.invitationURL = result.data.url
      this.$forceUpdate()
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
