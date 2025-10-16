<script setup lang="ts">
import { useLexicalComposer } from "lexical-vue";
import { useEffect } from "../../composables/useEffect";
import { EquationNode, $createEquationNode } from "../../nodes/EquationNode/EquationNode";
import { CommandPayload } from "./EquationsPlugin.shared";
import { INSERT_EQUATION_COMMAND } from "./EquationsPlugin.shared";
import { $createParagraphNode, $insertNodes, COMMAND_PRIORITY_EDITOR } from "lexical";
import { $isRootOrShadowRoot } from "lexical";
import { $wrapNodeInElement } from "@lexical/utils";

const editor = useLexicalComposer();

useEffect(() => {
  if (!editor.hasNodes([EquationNode])) {
    throw new Error(
      'EquationsPlugins: EquationsNode not registered on editor',
    );
  }

  return editor.registerCommand<CommandPayload>(
    INSERT_EQUATION_COMMAND,
    (payload) => {
      const {equation, inline} = payload;
      const equationNode = $createEquationNode(equation, inline);

      $insertNodes([equationNode]);
      if ($isRootOrShadowRoot(equationNode.getParentOrThrow())) {
        $wrapNodeInElement(equationNode, $createParagraphNode).selectEnd();
      }

      return true;
    },
    COMMAND_PRIORITY_EDITOR,
  );
}, [editor]);
</script>

<template>
</template>
