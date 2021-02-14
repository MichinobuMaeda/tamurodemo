<template>
  <v-row justify="center">
    <v-col class="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
      <PageTitle
        text-color="h2--text"
        icon-color="h2"
        :icon="icon('Administration')"
      >
        <template v-slot:title>{{ $t('Administration') }}</template>
      </PageTitle>

      <AdminSectionHeader v-model="target" target="users" :sectionIcon="icon('Users')" :label="$t('Users')" />
      <Users v-if="target === 'users'" />

      <AdminSectionHeader v-model="target" target="categories" :sectionIcon="icon('Categories')" :label="$t('Categories')" />
      <Categories v-if="target === 'categories'" />

      <AdminSectionHeader v-model="target" target="invitation" :sectionIcon="icon('Invitation')" :label="$t('Invitation')" />
      <Invitation v-if="target === 'invitation'" />

      <AdminSectionHeader v-model="target" target="defaults" :sectionIcon="icon('Defaults')" :label="$t('Defaults')" />
      <Defaults v-if="target === 'defaults'" />

      <AdminSectionHeader v-model="target" target="auth" :sectionIcon="icon('Sign in')" :label="$t('Authentication')" />
      <Authentication v-if="target === 'auth'" />

      <AdminSectionHeader v-model="target" target="service" :sectionIcon="icon('Service settings')" :label="$t('Service settings')" />
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
import Defaults from '../parts/admin/Defaults'
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
    Defaults,
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
