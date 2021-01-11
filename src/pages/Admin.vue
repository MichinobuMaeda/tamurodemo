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

      <AdminSectionHeader v-model="page.target" target="users" :sectionIcon="icon('Users')" :label="$t('Users')" />
      <Users v-if="page.target === 'users'" />

      <AdminSectionHeader v-model="page.target" target="categories" :sectionIcon="icon('Categories')" :label="$t('Categories')" />
      <Categories v-if="page.target === 'categories'" />

      <AdminSectionHeader v-model="page.target" target="invitation" :sectionIcon="icon('Invitation')" :label="$t('Invitation')" />
      <Invitation v-if="page.target === 'invitation'" />

      <AdminSectionHeader v-model="page.target" target="defaults" :sectionIcon="icon('Defaults')" :label="$t('Defaults')" />
      <Defaults v-if="page.target === 'defaults'" />

      <AdminSectionHeader v-model="page.target" target="auth" :sectionIcon="icon('Sign in')" :label="$t('Authentication')" />
      <Authentication v-if="page.target === 'auth'" />

      <AdminSectionHeader v-model="page.target" target="service" :sectionIcon="icon('Service settings')" :label="$t('Service settings')" />
      <Service v-if="page.target === 'service'" />

    </v-col>
  </v-row>
</template>

<script>
import { reactive, watch } from '@vue/composition-api'
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
  setup (prop, { root }) {
    const store = useStore()
    const page = reactive({
      target: root.$route.params ? root.$route.params.target : ''
    })

    watch(() => root.$route, route => { page.target = route.params.target || '' })

    return {
      ...store,
      page
    }
  }
}
</script>
