<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="conf.icon('Administration')"
      >
        <template v-slot:title>{{ $t('Administration') }}</template>
      </PageTitle>

      <AdminSectionHeader v-model="target" target="users" :sectionIcon="conf.icon('Users')" :label="$t('Users')" />
      <Users v-if="target === 'users'" />

      <AdminSectionHeader v-model="target" target="categories" :sectionIcon="conf.icon('Categories')" :label="$t('Categories')" />
      <Categories v-if="target === 'categories'" />

      <AdminSectionHeader v-model="target" target="invitation" :sectionIcon="conf.icon('Invitation')" :label="$t('Invitation')" />
      <Invitation v-if="target === 'invitation'" />

      <AdminSectionHeader v-model="target" target="defaults" :sectionIcon="conf.icon('Defaults')" :label="$t('Defaults')" />
      <UiPreferences :entity="state.service.conf" v-if="target === 'defaults'" class="my-2" />

      <AdminSectionHeader v-model="target" target="auth" :sectionIcon="conf.icon('Sign in')" :label="$t('Authentication')" />
      <Authentication v-if="target === 'auth'" />

      <AdminSectionHeader v-model="target" target="service" :sectionIcon="conf.icon('Service settings')" :label="$t('Service settings')" />
      <Service v-if="target === 'service'" />

    </v-col>
  </v-row>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useStore } from '../store'
import PageTitle from '../components/PageTitle'
import AdminSectionHeader from '../parts/admin/AdminSectionHeader'
import Users from '../parts/admin/Users'
import Categories from '../parts/admin/Categories'
import Invitation from '../parts/admin/Invitation'
import UiPreferences from '../parts/UiPreferences'
import Authentication from '../parts/admin/Authentication'
import Service from '../parts/admin/Service'

export default {
  name: 'PageAdmin',
  components: {
    PageTitle,
    AdminSectionHeader,
    Users,
    Categories,
    Invitation,
    UiPreferences,
    Authentication,
    Service
  },
  setup () {
    const store = useStore()
    const { state } = store

    return {
      ...store,
      target: computed(() => state.route.params ? state.route.params.target : '')
    }
  }
}
</script>
