<script setup lang="ts">
import { isSVG, useSuspenseImage } from "./ImageNode.shard"
import { computed, ref, watch } from "vue"
import BrokenImage from "./BrokenImage.vue"

const props = defineProps<{
  altText: string
  className: string | null
  height: "inherit" | number
  maxWidth: number
  src: string
  width: "inherit" | number
}>()

const isSVGImage = isSVG(props.src)
const status = await useSuspenseImage(props.src)
const error = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)

const emit = defineEmits<{
  (event: "error"): void
  (event: "init", image: HTMLImageElement | null): void
}>()

watch(imageRef, (newImage) => {
  emit("init", newImage)
})

if (status.error) {
  error.value = true
  emit("error")
}

const imageStyle = computed(() => {
  const { height, maxWidth, width } = props
  if (!isSVGImage || status.error) {
    return {
      height,
      maxWidth,
      width
    }
  }

  // Use natural dimensions if available, otherwise fallback to defaults
  const naturalWidth = status.width
  const naturalHeight = status.height

  let finalWidth = naturalWidth
  let finalHeight = naturalHeight

  // Scale down if width exceeds maxWidth while maintaining aspect ratio
  if (finalWidth > maxWidth) {
    const scale = maxWidth / finalWidth
    finalWidth = maxWidth
    finalHeight = Math.round(finalHeight * scale)
  }

  // Scale down if height exceeds maxHeight while maintaining aspect ratio
  const maxHeight = 500
  if (finalHeight > maxHeight) {
    const scale = maxHeight / finalHeight
    finalHeight = maxHeight
    finalWidth = Math.round(finalWidth * scale)
  }

  return {
    height: finalHeight,
    maxWidth,
    width: finalWidth
  }
})
</script>

<template>
  <BrokenImage v-if="error" />

  <img
    v-else
    :class="className || undefined"
    :src="src"
    :alt="altText"
    ref="imageRef"
    :style="imageStyle"
    @error="emit('error')"
    draggable="false"
    :aria-label="altText"
  />
</template>
