<script setup lang="ts">
import { useLexicalComposer } from "lexical-vue"
import { useEffect } from "../../composables/useEffect"
import { PollNode } from "../../nodes/PollNode/PollNode"
import { INSERT_POLL_COMMAND } from "./PollPlugin.shared"
import { $createPollNode } from "../../nodes/PollNode/PollNode"
import { createPollOption } from "../../nodes/PollNode/PollNode.shared"
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR
} from "lexical"
import { $wrapNodeInElement } from "@lexical/utils"

const editor = useLexicalComposer()
useEffect(() => {
  if (!editor.hasNodes([PollNode])) {
    throw new Error("PollPlugin: PollNode not registered on editor")
  }

  return editor.registerCommand<string>(
    INSERT_POLL_COMMAND,
    (payload) => {
      const pollNode = $createPollNode(payload, [createPollOption(), createPollOption()])
      $insertNodes([pollNode])
      if ($isRootOrShadowRoot(pollNode.getParentOrThrow())) {
        $wrapNodeInElement(pollNode, $createParagraphNode).selectEnd()
      }

      return true
    },
    COMMAND_PRIORITY_EDITOR
  )
}, [() => editor])
</script>

<template></template>
