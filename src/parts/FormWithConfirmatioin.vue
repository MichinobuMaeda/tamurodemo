<template>
  <v-form v-model="page.valid">

    <div class="text-h3 h3--text mb-4">
      <v-icon color="h3">{{ icon(titleIcon) }}</v-icon>
      {{ $t(titleText) }}
    </div>

    <v-text-field
      v-if="reauthentication"
      v-model="page.password"
      :type="page.showPassword ? 'text' : 'password'"
      :rules="[rulePassword]"
      :label="$t(labelCurrentPassword)"
      :append-icon="page.showPassword ? icon('Visible') : icon('Invisible')"
      @click:append="() => { page.showPassword = !page.showPassword }"
      @input ="page.statusMessage = ''"
    ></v-text-field>

    <v-text-field
      v-model="page.value"
      :type="page.showValue ? 'text' : 'password'"
      :rules="rules"
      :label="$t(labelValue)"
      :append-icon="password ? page.showValue ? icon('Visible') : icon('Invisible') : null"
      @click:append="() => { if (password) { page.showValue = !page.showValue } }"
      @input="page.statusMessage = ''"
    ></v-text-field>

    <v-text-field
      v-model="page.confirmation"
      :type="page.showConfirmation ? 'text' : 'password'"
      :rules="rules"
      :label="$t(labelConfirmation)"
      :append-icon="password ? page.showConfirmation ? icon('Visible') : icon('Invisible') : null"
      @click:append="() => { if (password) { page.showConfirmation = !page.showConfirmation } }"
      @input="page.statusMessage = ''"
    ></v-text-field>
    <div
      v-if="page.value && page.confirmation && (page.value !== page.confirmation)"
      class="error--text" style="font-size: 12px;"
    >
      {{ $t(messageComfirmationFailed) }}
    </div>

    <v-alert dense outlined text type="warning" v-if="page.statusMessage">
      {{ $t(page.statusMessage) }}
    </v-alert>
    <div class="text-right">
      <DefaultButton
        color="primary"
        :icon="icon('Save')"
        :label="$t('Save')"
        @click="onClick"
        :disabled="!!state.waitProc || (reauthentication && !page.password) || !page.value || !page.confirmation || page.value !== page.confirmation || !page.valid"
      />
    </div>
  </v-form>
</template>

<script>
import { reactive } from '@vue/composition-api'
import { useStore } from '../store'
import { reauthenticate } from '../auth'
import DefaultButton from '../components/DefaultButton'

export default {
  name: 'FormWithConfirmatioin',
  components: {
    DefaultButton
  },
  props: {
    titleIcon: String,
    titleText: String,
    labelCurrentPassword: String,
    labelValue: String,
    labelConfirmation: String,
    messageComfirmationFailed: String,
    messageUpdateFailed: String,
    reauthentication: {
      type: Boolean,
      default: true
    },
    password: {
      type: Boolean,
      default: false
    },
    rules: Array
  },
  setup (props, { emit }) {
    const store = useStore()
    const { waitFor } = store
    const page = reactive({
      valid: false,
      password: '',
      value: '',
      confirmation: '',
      showPassword: false,
      showValue: !props.password,
      showConfirmation: !props.password,
      statusMessage: ''
    })

    return {
      page,
      ...store,
      onClick: () => waitFor(
        async () => {
          try {
            if (props.reauthentication) {
              await reauthenticate(store, page.password)
            }
            emit('click', page.value)

            page.password = ''
            page.value = ''
            page.confirmation = ''
            page.showPassword = false
            page.showValue = !props.password
            page.showConfirmation = !props.password
            page.statusMessage = 'Completed'
          } catch (e) {
            page.statusMessage = props.messageUpdateFailed
          }
        }
      )
    }
  }
}
</script>
