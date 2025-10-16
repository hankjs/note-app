<script setup lang="ts">
import brokenImage from "../../assets/images/image-broken.svg"
</script>

<template>
  <img
    :src="brokenImage"
    :style="{
      height: 200,
      opacity: 0.2,
      width: 200
    }"
    draggable="false"
    alt="Broken image"
  />
</template>
