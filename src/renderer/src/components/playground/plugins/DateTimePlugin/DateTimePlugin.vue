<script setup lang="ts">
import { useLexicalComposer } from "lexical-vue";

import {
  $createDateTimeNode,
  DateTimeNode,
} from '../../nodes/DateTimeNode/DateTimeNode';
import { useEffect } from "../../composables/useEffect";
import { $wrapNodeInElement, mergeRegister } from "@lexical/utils";
import { DateTimePluginCommandPayload, INSERT_DATETIME_COMMAND } from "./DateTimePlugin.shared";
import { $createParagraphNode, $insertNodes, $isRootOrShadowRoot, COMMAND_PRIORITY_EDITOR } from "lexical";
const editor = useLexicalComposer();

  useEffect(() => {
    if (!editor.hasNodes([DateTimeNode])) {
      throw new Error('DateTimePlugin: DateTimeNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<DateTimePluginCommandPayload>(
        INSERT_DATETIME_COMMAND,
        (payload) => {
          const {dateTime} = payload;
          const dateTimeNode = $createDateTimeNode(dateTime);

          $insertNodes([dateTimeNode]);
          if ($isRootOrShadowRoot(dateTimeNode.getParentOrThrow())) {
            $wrapNodeInElement(dateTimeNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
  }, [() => editor]);
</script>

<template>
</template>
