<script setup lang="ts">
import type { AppState, BinaryFiles, LibraryItem_v1 } from "@excalidraw/excalidraw/types"
import { computed, CSSProperties, ref } from "vue"
import { useEffect } from "../../composables/useEffect"
import { exportToSvg } from "@excalidraw/excalidraw"
import { Dimension, ImageType } from "./ExcalidrawNode.shared"
import { ExcalidrawInitialElements } from "../../ui/ExcalidrawModal/ExcalidrawModal.shared"


const props = defineProps<{
  /**
   * Configures the export setting for SVG/Canvas
   */
  appState: AppState
  /**
   * The css class applied to image to be rendered
   */
  className?: string
  /**
   * The Excalidraw elements to be rendered as an image
   */
  elements: LibraryItem_v1[] | ExcalidrawInitialElements
  /**
   * The Excalidraw files associated with the elements
   */
  files: BinaryFiles
  /**
   * The height of the image to be rendered
   */
  height?: Dimension
  /**
   * The type of image to be rendered
   */
  imageType?: ImageType
  /**
   * The css class applied to the root element of this component
   */
  rootClassName?: string | null
  /**
   * The width of the image to be rendered
   */
  width?: Dimension
}>()

const emit = defineEmits<{
  (event: "error"): void
  (event: "init", image: HTMLImageElement | null): void
}>()

const imageContainerRef = defineModel("imageContainer")
// exportToSvg has fonts from excalidraw.com
// We don't want them to be used in open source
const removeStyleFromSvg_HACK = (svg: SVGElement) => {
  const styleTag = svg?.firstElementChild?.firstElementChild

  // Generated SVG is getting double-sized by height and width attributes
  // We want to match the real size of the SVG element
  const viewBox = svg.getAttribute("viewBox")
  if (viewBox != null) {
    const viewBoxDimensions = viewBox.split(" ")
    svg.setAttribute("width", viewBoxDimensions[2])
    svg.setAttribute("height", viewBoxDimensions[3])
  }

  if (styleTag && styleTag.tagName === "style") {
    styleTag.remove()
  }
}

const containerStyle = computed(() => {
  const style = {} as CSSProperties
  if (props.width !== "inherit") {
    style.width = `${props.width}px`
  }
  if (props.height !== "inherit") {
    style.height = `${props.height}px`
  }
  return style
})

const Svg = ref<SVGElement | null>(null)

useEffect(() => {
  const setContent = async () => {
    const svg: SVGElement = await exportToSvg({
      appState: props.appState,
      elements: props.elements,
      files: props.files
    })
    removeStyleFromSvg_HACK(svg)

    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.setAttribute("display", "block")

    Svg.value = svg
  }
  setContent()
}, [() => props.elements, () => props.files, () => props.appState])
</script>

<template>
  <div
    :ref="(el) => imageContainerRef = el"
    :class="rootClassName ?? ''"
    :style="containerStyle"
    v-html="Svg?.outerHTML ?? ''"
  />
</template>
