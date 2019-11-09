<template>
  <q-page class="q-pa-md">
    <div class="row">
      <div class="col q-gutter-xs">
        <div class="text-h5 text-light-green-10">
          <q-avatar size="64px">
            <q-icon name="bug_report" />
          </q-avatar>
          Debug
        </div>
        <div>システム管理者だけに表示されるページです。</div>

        <q-card>
          <q-card-section class="bg-lime-10 text-white">
            <div class="text-h6">me</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <pre>{{ $store.state.me ? JSON.stringify({ id: $store.state.me.id, data: $store.state.me.data() }, 0, 2) : null }}</pre>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section class="bg-lime-10 text-white">
            <div class="text-h6">misc</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <pre>{{ JSON.stringify({
              standalone: $store.state.standalone,
              isIE11: $store.state.isIE11,
            }, 0, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section class="bg-lime-10 text-white">
            <div class="text-h6">accounts</div>
          </q-card-section>
          <q-separator />
          <q-card-section v-for="account in $store.state.accounts" v-bind:key="account.id">
            <q-expansion-item
              expand-separator
              :label="'account [ ' + account.id + ' ]'"
              header-class="bg-lime-2"
            >
              <pre>{{ JSON.stringify(account.data(), 0, 2) }}</pre>
            </q-expansion-item>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section class="bg-lime-10 text-white">
            <div class="text-h6">properties</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <pre>{{ JSON.stringify($store.state.properties, 0, 2) }}</pre>
          </q-card-section>
        </q-card>

        <q-card>
          <q-card-section class="bg-lime-10 text-white">
            <div class="text-h6">streets</div>
          </q-card-section>
          <q-separator />
          <q-card-section>
            <pre>{{ JSON.stringify($store.state.streets, 0, 2) }}</pre>
          </q-card-section>
        </q-card>

      </div>
    </div>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'PageDebug'
}
</script>
