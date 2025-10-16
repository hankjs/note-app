<script setup lang="ts">
import type { LexicalEditor } from "lexical"
import { calculateZoomLevel } from "@lexical/utils"
import { computed, ref, useModel, watch } from "vue"

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

const Direction = {
  east: 1 << 0,
  north: 1 << 3,
  south: 1 << 1,
  west: 1 << 2
}

const props = defineProps<{
  editor: LexicalEditor
  maxWidth?: number
  showCaption: boolean
  captionsEnabled: boolean
}>()

const emit = defineEmits<{
  (e: "resizeStart"): void
  (
    e: "resizeEnd",
    payload: {
      width: "inherit" | number
      height: "inherit" | number
    }
  ): void
  (
    e: "init",
    payload: {
      image: HTMLImageElement
      button: HTMLButtonElement
    }
  ): void
}>()

const showCaptionRef = defineModel("showCaption")
const imageRef = ref<HTMLImageElement | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)

const controlWrapperRef = ref<HTMLDivElement | null>(null)
const userSelect = ref({
  priority: "",
  value: "default"
})
const positioningRef = ref<{
  currentHeight: "inherit" | number
  currentWidth: "inherit" | number
  direction: number
  isResizing: boolean
  ratio: number
  startHeight: number
  startWidth: number
  startX: number
  startY: number
}>({
  currentHeight: 0,
  currentWidth: 0,
  direction: 0,
  isResizing: false,
  ratio: 0,
  startHeight: 0,
  startWidth: 0,
  startX: 0,
  startY: 0
})
const editorRootElement = computed(() => props.editor.getRootElement())
// Find max width, accounting for editor padding.
const maxWidthContainer = computed(() =>
  props.maxWidth
    ? props.maxWidth
    : editorRootElement.value !== null
      ? editorRootElement.value.getBoundingClientRect().width - 20
      : 100
)
const maxHeightContainer = computed(() =>
  editorRootElement.value !== null
    ? editorRootElement.value.getBoundingClientRect().height - 20
    : 100
)

const minWidth = 100
const minHeight = 100

const setStartCursor = (direction: number) => {
  const ew = direction === Direction.east || direction === Direction.west
  const ns = direction === Direction.north || direction === Direction.south
  const nwse =
    (direction & Direction.north && direction & Direction.west) ||
    (direction & Direction.south && direction & Direction.east)

  const cursorDir = ew ? "ew" : ns ? "ns" : nwse ? "nwse" : "nesw"

  if (editorRootElement.value !== null) {
    editorRootElement.value.style.setProperty("cursor", `${cursorDir}-resize`, "important")
  }
  if (document.body !== null) {
    document.body.style.setProperty("cursor", `${cursorDir}-resize`, "important")
    userSelect.value.value = document.body.style.getPropertyValue("-webkit-user-select")
    userSelect.value.priority = document.body.style.getPropertyPriority("-webkit-user-select")
    document.body.style.setProperty("-webkit-user-select", `none`, "important")
  }
}

const setEndCursor = () => {
  if (editorRootElement.value !== null) {
    editorRootElement.value.style.setProperty("cursor", "text")
  }
  if (document.body !== null) {
    document.body.style.setProperty("cursor", "default")
    document.body.style.setProperty(
      "-webkit-user-select",
      userSelect.value.value,
      userSelect.value.priority
    )
  }
}

const handlePointerDown = (event: PointerEvent, direction: number) => {
  if (!props.editor.isEditable()) {
    return
  }

  const image = imageRef.value
  const controlWrapper = controlWrapperRef.value

  if (image !== null && controlWrapper !== null) {
    event.preventDefault()
    const { width, height } = image.getBoundingClientRect()
    const zoom = calculateZoomLevel(image)
    const positioning = positioningRef.value
    positioning.startWidth = width
    positioning.startHeight = height
    positioning.ratio = width / height
    positioning.currentWidth = width
    positioning.currentHeight = height
    positioning.startX = event.clientX / zoom
    positioning.startY = event.clientY / zoom
    positioning.isResizing = true
    positioning.direction = direction

    setStartCursor(direction)
    emit("resizeStart")

    controlWrapper.classList.add("image-control-wrapper--resizing")
    image.style.height = `${height}px`
    image.style.width = `${width}px`

    document.addEventListener("pointermove", handlePointerMove)
    document.addEventListener("pointerup", handlePointerUp)
  }
}

const handlePointerMove = (event: PointerEvent) => {
  const image = imageRef.value
  const positioning = positioningRef.value

  const isHorizontal = positioning.direction & (Direction.east | Direction.west)
  const isVertical = positioning.direction & (Direction.south | Direction.north)

  if (image !== null && positioning.isResizing) {
    const zoom = calculateZoomLevel(image)
    // Corner cursor
    if (isHorizontal && isVertical) {
      let diff = Math.floor(positioning.startX - event.clientX / zoom)
      diff = positioning.direction & Direction.east ? -diff : diff

      const width = clamp(positioning.startWidth + diff, minWidth, maxWidthContainer.value)

      const height = width / positioning.ratio
      image.style.width = `${width}px`
      image.style.height = `${height}px`
      positioning.currentHeight = height
      positioning.currentWidth = width
    } else if (isVertical) {
      let diff = Math.floor(positioning.startY - event.clientY / zoom)
      diff = positioning.direction & Direction.south ? -diff : diff

      const height = clamp(positioning.startHeight + diff, minHeight, maxHeightContainer.value)

      image.style.height = `${height}px`
      positioning.currentHeight = height
    } else {
      let diff = Math.floor(positioning.startX - event.clientX / zoom)
      diff = positioning.direction & Direction.east ? -diff : diff

      const width = clamp(positioning.startWidth + diff, minWidth, maxWidthContainer.value)

      image.style.width = `${width}px`
      positioning.currentWidth = width
    }
  }
}
const handlePointerUp = () => {
  const image = imageRef.value
  const positioning = positioningRef.value
  const controlWrapper = controlWrapperRef.value
  if (image !== null && controlWrapper !== null && positioning.isResizing) {
    const width = positioning.currentWidth
    const height = positioning.currentHeight
    positioning.startWidth = 0
    positioning.startHeight = 0
    positioning.ratio = 0
    positioning.startX = 0
    positioning.startY = 0
    positioning.currentWidth = 0
    positioning.currentHeight = 0
    positioning.isResizing = false

    controlWrapper.classList.remove("image-control-wrapper--resizing")

    setEndCursor()
    emit("resizeEnd", { width, height })

    document.removeEventListener("pointermove", handlePointerMove)
    document.removeEventListener("pointerup", handlePointerUp)
  }
}

watch([imageRef, buttonRef], ([newImage, newButton]) => {
  if (!newImage || !newButton) {
    return
  }

  emit("init", {
    image: newImage,
    button: newButton
  })
})
</script>

<template>
  <div ref="controlWrapperRef">
    <button
      v-if="!showCaption && captionsEnabled"
      class="image-caption-button"
      ref="buttonRef"
      @click="
        () => {
          showCaptionRef = !showCaption
        }
      "
    >
      Add Caption
    </button>
    <div
      class="image-resizer image-resizer-n"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.north)
        }
      "
    />
    <div
      class="image-resizer image-resizer-ne"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.north | Direction.east)
        }
      "
    />
    <div
      class="image-resizer image-resizer-e"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.east)
        }
      "
    />
    <div
      class="image-resizer image-resizer-se"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.south | Direction.east)
        }
      "
    />
    <div
      class="image-resizer image-resizer-s"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.south)
        }
      "
    />
    <div
      class="image-resizer image-resizer-sw"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.south | Direction.west)
        }
      "
    />
    <div
      class="image-resizer image-resizer-w"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.west)
        }
      "
    />
    <div
      class="image-resizer image-resizer-nw"
      @pointerdown="
        (event) => {
          handlePointerDown(event, Direction.north | Direction.west)
        }
      "
    />
  </div>
</template>
