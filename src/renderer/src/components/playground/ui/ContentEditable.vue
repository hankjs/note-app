<script setup lang="ts">
import { LexicalContentEditable } from "lexical-vue"

defineProps<{
  className?: string
  placeholderClassName?: string
  placeholder?: string
}>()
</script>

<template>
  <LexicalContentEditable
    :class="className ?? 'ContentEditable__root'"
    :placeholder="placeholder"
  >
    <template v-if="placeholder" #placeholder>
      <div :class="placeholderClassName ?? 'ContentEditable__placeholder'">
        <slot name="placeholder">
          {{ placeholder }}
        </slot>
      </div>
    </template>
  </LexicalContentEditable>
</template>

<style>
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */
.ContentEditable__root {
  border: 0;
  font-size: 15px;
  display: block;
  position: relative;
  outline: 0;
  padding: 8px 46px 40px;
  min-height: 150px;
}
@media (max-width: 1025px) {
  .ContentEditable__root {
    padding-left: 8px;
    padding-right: 8px;
  }
}

.ContentEditable__placeholder {
  font-size: 15px;
  color: #999;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 8px;
  left: 46px;
  right: 28px;
  user-select: none;
  white-space: nowrap;
  display: inline-block;
  pointer-events: none;
}
@media (max-width: 1025px) {
  .ContentEditable__placeholder {
    left: 8px;
    right: 8px;
  }
}
</style>
