<script lang="ts" setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import i18n from "@/lib/i18n";
import { dismissSnackbar, snackbarMessages } from "@/lib/snackbar";

const current = computed(() => snackbarMessages.value[0]);
const layer = ref<HTMLElement>();
const nativePopover = "popover" in HTMLElement.prototype;
const busy = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
let returnFocus: HTMLElement | null = null;

function schedule() {
  clearTimeout(timer);
  const notice = current.value;
  if (
    !notice ||
    notice.error ||
    document.hidden ||
    layer.value?.matches(":hover") ||
    layer.value?.contains(document.activeElement)
  )
    return;
  timer = setTimeout(
    () => dismissSnackbar(notice.id),
    notice.action ? 8000 : 4000,
  );
}

function focusChanged(event: FocusEvent) {
  if (
    event.type === "focusin" &&
    !layer.value?.contains(event.relatedTarget as Node | null)
  )
    returnFocus =
      event.relatedTarget instanceof HTMLElement ? event.relatedTarget : null;
  schedule();
}

function hideLayer() {
  if (!current.value && nativePopover) layer.value?.hidePopover();
}

async function runAction() {
  const action = current.value?.action;
  if (!action || busy.value) return;
  busy.value = true;
  try {
    await action.run();
  } catch (error) {
    console.error("Snackbar action failed:", error);
  } finally {
    busy.value = false;
  }
}

watch(
  current,
  async () => {
    if (layer.value?.contains(document.activeElement)) {
      const target = returnFocus?.isConnected
        ? returnFocus
        : document.querySelector<HTMLElement>("main h1");
      target?.focus({ preventScroll: true });
    }
    await nextTick();
    if (current.value && nativePopover) layer.value?.showPopover();
    schedule();
  },
  { flush: "post" },
);

onMounted(() => {
  document.addEventListener("visibilitychange", schedule);
  if (current.value && nativePopover) layer.value?.showPopover();
  schedule();
});
onUnmounted(() => {
  clearTimeout(timer);
  document.removeEventListener("visibilitychange", schedule);
});
</script>

<template>
  <Teleport to="body">
    <div class="snackbarAnnouncement" role="status" aria-atomic="true"><span :key="current?.id">{{ !current?.error ? current?.message : '' }}</span></div>
    <div class="snackbarAnnouncement" role="alert" aria-atomic="true"><span :key="current?.id">{{ current?.error ? current.message : '' }}</span></div>
    <div
      ref="layer" class="snackbarLayer" :popover="nativePopover ? 'manual' : undefined"
      @mouseenter="schedule" @mouseleave="schedule"
      @focusin="focusChanged" @focusout="focusChanged"
    >
      <Transition name="snackbar" mode="out-in" @after-enter="schedule" @after-leave="hideLayer">
        <div v-if="current" :key="current.id" class="snackbar">
          <p class="snackbarMessage" aria-hidden="true">{{ current.message }}</p>
          <button v-if="current.action" type="button" class="snackbarAction" :disabled="busy" @click="runAction">{{ current.action.label }}</button>
          <button type="button" class="snackbarClose" :disabled="busy" :aria-label="i18n.t({ en: 'Close notification', ja: '通知を閉じる', 'zh-cn': '关闭通知', es: 'Cerrar notificación' })" @click="current && dismissSnackbar(current.id)"><span aria-hidden="true">×</span></button>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<style scoped>
.snackbarLayer {
  position: fixed;
  inset: calc(16px + env(safe-area-inset-top, 0px)) 16px auto;
  width: fit-content;
  min-width: min(344px, calc(100% - 32px));
  max-width: min(560px, calc(100% - 32px));
  margin: 0 auto;
  padding: 0;
  border: 0;
  background: transparent;
  overflow: visible;
  z-index: 1000;
  pointer-events: none;
}
.snackbar {
  --snackbar-action: 138 180 248;
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 48px;
  max-height: calc(100dvh - 32px);
  padding: 0 4px 0 16px;
  border-radius: 4px;
  background: rgb(var(--color-main));
  color: rgb(var(--color-base));
  box-shadow: 0 3px 5px -1px rgb(0 0 0 / .2), 0 6px 10px rgb(0 0 0 / .14), 0 1px 18px rgb(0 0 0 / .12);
  overflow: auto;
  pointer-events: auto;
}
.snackbarMessage {
  flex: 1;
  min-width: 0;
  padding-block: 14px;
  overflow-wrap: anywhere;
}
button {
  flex: none;
  min-height: 48px;
  padding: 0 12px;
  border: 0;
  border-radius: 4px;
  color: rgb(var(--snackbar-action));
  font: inherit;
  font-weight: 600;
  white-space: normal;
  letter-spacing: inherit;
}
button:hover:not(:disabled) { background: rgb(var(--color-base) / .08); }
button:focus-visible { outline: 2px solid currentColor; outline-offset: -4px; }
button:disabled { opacity: .5; cursor: default; }
.snackbarAction { max-width: 40%; }
.snackbarClose { width: 48px; padding: 0; color: inherit; font-size: 26px; font-weight: 400; }
.snackbar-enter-active, .snackbar-leave-active { transition: opacity .16s ease-out, transform .16s ease-out; }
.snackbar-enter-from, .snackbar-leave-to { opacity: 0; transform: translateY(-8px); }
.snackbarAnnouncement { position: fixed; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (prefers-color-scheme: dark) { .snackbar { --snackbar-action: 51 103 214; } }
@media (prefers-reduced-motion: reduce) {
  .snackbar-enter-active, .snackbar-leave-active { transition: none; }
  .snackbar-enter-from, .snackbar-leave-to { opacity: 1; transform: none; }
}
</style>
