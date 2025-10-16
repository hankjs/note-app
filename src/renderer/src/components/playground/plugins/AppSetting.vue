<script setup lang="ts">
import { provide } from 'vue'
import { useSettingsProvider, SettingsProviderKey } from '../composables/useSettings'

const { context, setOption } = useSettingsProvider()
provide(SettingsProviderKey, { setOption, settings: context })

</script>

<template>
  <slot />
</template>
