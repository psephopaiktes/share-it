<script lang="ts" setup>
import $store from "@/entrypoints/popup/store";
import i18n from "@/lib/i18n";

defineProps<{
  label: Record<string, string>;
  img: string;
  darkLogo?: boolean;
  tooltip?: Record<string, string>;
  disabled?: boolean;
}>();
</script>

<template>
  <button :disabled="disabled || $store.editing || !$store.tab" :class="{ edit: $store.editing, hasTooltip: Boolean(tooltip) }">
    <img :src="img" alt="Service Icon" :class="{ invert: darkLogo }" class="icon" />

    <span class="label">
      {{ i18n.t(label) }}
    </span>

    <span v-if="tooltip" class="tooltip" :data-tooltip="tooltip ? i18n.t(tooltip) : undefined" title="">
      <img src="/img/help.svg" alt="help" />
    </span>
  </button>
</template>

<style scoped>
button:disabled:not(.edit) { opacity: .5; cursor: default; }
button {
  width: 100%;
  height: 40px;
  border: none;
  color: rgb(var(--color-main) / .9);
  text-align: left;
  overflow: visible;
  position: relative;

  .icon {
    vertical-align: middle;
    width: 16px;
    aspect-ratio: 1;

    &.invert {
      @media (prefers-color-scheme: dark) {
        filter: invert(1);
      }
    }
  }

  .label {
    display: inline-block;
    width: calc(100% - 24px);
    vertical-align: middle;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tooltip {
    display: none;
  }
}

button.edit {
  pointer-events: none;
  padding-right: 160px;

  .icon {
    margin-left: 56px;
  }

  .label {
    cursor: grab;
    width: 100%;
  }

  .tooltip {
    display: block;
    width: 24px;
    aspect-ratio: 1;
    position: absolute;
    top: calc(50% - 12px);
    right: 56px;
    border-radius: 50%;
    pointer-events: all;

    &:hover {
      background: rgb(var(--color-main) / .1);
    }

    img {
      width: 14px;
      margin: 5px;
      aspect-ratio: 1;
    }

    &::before {
      content: attr(data-tooltip);
      position: absolute;
      top: 95%;
      right: 8px;
      pointer-events: none;
      z-index: 100;
      width: 200px;
      height: auto;
      padding: 4px 6px;
      white-space: normal;
      display: none;

      font-size: 11px;
      color: rgb(var(--color-main) / .8);
      background-color: rgb(var(--color-base) / .4);
      backdrop-filter: blur(6px);
      box-shadow: 2px 6px 16px -2px rgb(var(--color-main) / .2);
      border: 1px solid rgb(var(--color-theme) / .6);
      border-radius: 8px 0 8px 8px;
    }

    &:hover::before {
      display: block;
    }
  }
}
</style>
