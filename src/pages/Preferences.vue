<template>
  <q-page class="row justify-center">
    <div :class="isManager ? conf.styles.col1 : conf.styles.col2">
      <q-tabs
        v-if="isTab && !isManager"
        ref="tabs" class="text-secondary" inline-label
        v-model="tab"
      >
        <q-tab name="list" :icon="conf.styles.iconPreferences" :label="$t('preferences')" />
        <q-tab name="chat" :icon="conf.styles.iconInquire" :label="$t('contactUs')" />
      </q-tabs>
      <div v-if="tab !== 'chat'">
        <p v-if="!isTab" :class="conf.styles.pageTitle">
          <q-avatar :icon="conf.styles.iconPreferences" />
          {{ $t('myPreferences', { name: user(me.id).name }) }}
        </p>

        <div class="text-red">{{ $t($store.state.message.key, $store.state.message.params) }}</div>
        <div class="q-my-md">{{ $t('signInMethod') }}</div>

        <div v-for="(item, index) in oauthProviders" v-bind:key="index">
          <q-btn
            v-if="item.id"
            class="q-my-md full-width" align="left" outline no-caps :color="item.color"
            :icon="item.icon" :label="$t(item.active ? 'removeProvider' : 'addProvider', { provider: item.name })"
            @click="item.active ? unlinkProvider({ provider: item.id }) : linkProvider({ provider: item.id })"
          >
            <q-space />
            <q-icon :name="item.active ? conf.styles.iconRemove : conf.styles.iconAdd" />
          </q-btn>
        </div>

        <div v-if="(conf.auth.emailLink || conf.auth.password) && isEmail">
          <q-separator class="q-my-md" />
          <div>{{ $t('emailAddressSaved') }}</div>
          <div>{{ currentUser && currentUser.email }}</div>
          <q-btn
            v-if="conf.auth.password"
            class="q-my-md full-width" align="left" outline color="brown"
            :icon="conf.styles.iconPassword" :label="$t('resetPassword')"
            @click="sendPasswordResetEmail(currentUser.email)"
          >
            <q-space />
            <q-icon name="fas fa-reply" />
          </q-btn>
        </div>
        <div v-else-if="conf.auth.emailLink || conf.auth.password">
          <q-separator class="q-my-md" />
          <q-input v-model="email" type="email" :rules="emailRule" :label="$t('emailAddress')">
            <template v-slot:before>
              <q-icon name="far fa-envelope" />
            </template>
          </q-input>
          <q-btn
            class="full-width" align="left" outline color="brown"
            :icon="conf.styles.iconAdd" :label="$t('addProvider', { provider: $t('emailAddress') })"
            :disable="(!email) || (!conf.validators.email(email))"
            @click="linkProvider({ provider: conf.auth.emailLink, email })"
          />
        </div>

        <q-separator class="q-my-md" />

        <q-btn
          class="q-my-md full-width" align="left" color="secondary" outline no-caps
          :icon="conf.styles.iconUser" :label="$t('editName')"
          @click="editName"
        />
        <Dialog ref="name" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-input type="text" v-model="name" :label="$t('name')" :rules="nameRule" />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveName" :disable="!name || name === user(me.id).name"
            />
          </q-card-section>
        </Dialog>

        <q-btn
          class="q-my-md full-width" align="left" color="secondary" outline no-caps
          :icon="conf.styles.iconMenu" :label="$t('menuPosition') + ': ' + currMenuPosition.label"
          @click="editMenuPosition"
        />
        <Dialog ref="menuPosition" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-select
              :label="$t('menuPosition')"
              v-model="menuPosition" map-options
              :options="conf.styles.menuPositions($store.getters.locale)"
            />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveMenuPosition" :disable="menuPosition.value === me.menuPosition"
            />
          </q-card-section>
        </Dialog>

        <q-btn
          class="q-my-md full-width" align="left" color="secondary" outline no-caps
          :icon="conf.styles.iconTimezone" :label="$t('timezone') + ': ' + me.timezone"
          @click="editTimezone"
        />
        <Dialog ref="timezone" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-select
              :label="$t('timezone')"
              v-model="timezone"
              :options="conf.locales.timezones"
            />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveTimezone" :disable="timezone === me.timezone"
            />
          </q-card-section>
        </Dialog>

        <q-btn
          class="q-my-md full-width" align="left" color="secondary" outline no-caps
          :icon="conf.styles.iconLocale" :label="$t('locale') + ': ' + currLocale.label"
          @click="editLocale"
        />
        <Dialog ref="locale" :color="'primary'" :icon="conf.styles.iconEdit" :title="$t('edit')">
          <q-card-section>
            <q-select
              :label="$t('locale')"
              v-model="locale"
              :options="conf.locales.locales"
            />
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="primary" no-caps :label="$t('save')"
              @click="saveLocale" :disable="locale === me.locale"
            />
          </q-card-section>
        </Dialog>

        <q-separator class="q-my-md" />

        <q-btn
          class="q-my-md full-width" align="left" outline color="negative"
          :icon="conf.styles.iconSignOut" :label="$t('signout')"
          @click="$refs.signout.$refs.dialog.show()"
        />
        <Dialog ref="signout" :color="'negative'" :icon="conf.styles.iconWarn" :title="$t('confirm')">
          <q-card-section>
            <div>{{ $t('confirmSingOut') }}</div>
          </q-card-section>
          <q-card-section align="right">
            <q-btn
              color="negative" no-caps :label="$t('ok')"
              @click="signOut"
            />
          </q-card-section>
        </Dialog>
      </div>
    </div>
    <div v-if="!isManager && tabState !== 'list'" :class="conf.styles.col2">
      <p v-if="!isTab" :class="conf.styles.pageTitle">
        <q-avatar :icon="conf.styles.iconInquire" />
        {{ $t('contact', { name: group('manager').name }) }}
      </p>
      <GroupChat :id="'request'" v-if="!isManager" />
    </div>

  </q-page>
</template>

<style>
</style>

<script>
import { mapActions, mapGetters } from 'vuex'
import Dialog from '../components/Dialog'
import GroupChat from '../components/GroupChat'

export default {
  name: 'PagePreferences',
  components: {
    Dialog,
    GroupChat
  },
  data () {
    return {
      tab: 'list',
      email: '',
      isPwd: true,
      emailRule: [ v => (!v || this.conf.validators.email(v)) || this.$t('invalidEmailAddress') ],
      name: '',
      nameRule: [ v => !!v || this.$t('required') ],
      menuPosition: this.$store.getters.menuPosition,
      timezone: this.$store.getters.timezone,
      locale: this.$store.getters.locale
    }
  },
  methods: {
    editName () {
      this.name = this.user(this.me.id).name
      this.$refs.name.$refs.dialog.show()
    },
    async saveName () {
      this.$refs.name.$refs.dialog.hide()
      await this.$store.state.db.collection('users').doc(this.me.id).update({
        name: this.name,
        updatedAt: new Date()
      })
    },
    editMenuPosition () {
      this.menuPosition = this.$store.getters.menuPosition
      this.$refs.menuPosition.$refs.dialog.show()
    },
    async saveMenuPosition () {
      this.$refs.menuPosition.$refs.dialog.hide()
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        menuPosition: this.menuPosition.value,
        updatedAt: new Date()
      })
    },
    editTimezone () {
      this.timezone = this.me.timezone
      this.$refs.timezone.$refs.dialog.show()
    },
    async saveTimezone () {
      this.$refs.timezone.$refs.dialog.hide()
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        timezone: this.timezone,
        updatedAt: new Date()
      })
    },
    editLocale () {
      this.locale = this.currLocale
      this.$refs.locale.$refs.dialog.show()
    },
    async saveLocale () {
      this.$refs.locale.$refs.dialog.hide()
      await this.$store.state.db.collection('accounts').doc(this.me.id).update({
        locale: this.locale.value,
        updatedAt: new Date()
      })
    },
    ...mapActions([
      'linkProvider',
      'unlinkProvider',
      'sendPasswordResetEmail',
      'signOut'
    ])
  },
  computed: {
    currMenuPosition () {
      return this.conf.styles.menuPositions(this.$store.getters.locale).reduce(
        (ret, cur) => cur.value === this.me.menuPosition ? cur : ret,
        {}
      )
    },
    currLocale () {
      return this.conf.locales.locales.reduce(
        (ret, cur) => cur.value === this.me.locale ? cur : ret,
        {}
      )
    },
    tabState () {
      return (!this.isManager && this.isTab) ? this.tab : 'all'
    },
    ...mapGetters([
      'conf',
      'isTab',
      'me',
      'group',
      'user',
      'currentUser',
      'isValid',
      'isManager',
      'isSignInMethod',
      'isEmail',
      'oauthProviders'
    ])
  }
}
</script>
