<script setup lang="ts">
import { useLexicalComposer } from 'lexical-vue'
import { useEffect } from '../composables/useEffect'
import {$insertNodeToNearestRoot, mergeRegister} from '@lexical/utils';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical';

import {$createPageBreakNode, PageBreakNode} from '../nodes/PageBreakNode';
import { INSERT_PAGE_BREAK } from './PageBreakPlugin.shared';

const editor = useLexicalComposer()
useEffect(() => {
  if (!editor.hasNodes([PageBreakNode])) {
      throw new Error(
        'PageBreakPlugin: PageBreakNode is not registered on editor',
      );
    }

    return mergeRegister(
      editor.registerCommand(
        INSERT_PAGE_BREAK,
        () => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection)) {
            return false;
          }

          const focusNode = selection.focus.getNode();
          if (focusNode !== null) {
            const pgBreak = $createPageBreakNode();
            $insertNodeToNearestRoot(pgBreak);
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    );
}, [() => editor])
</script>

<template>
</template>
