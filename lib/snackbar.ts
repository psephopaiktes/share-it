import { onScopeDispose, readonly, shallowRef } from "vue";

interface SnackbarOptions {
  error?: boolean;
  action?: { label: string; run: () => unknown };
}

const messages = shallowRef<
  (SnackbarOptions & { id: number; source: symbol; message: string })[]
>([]);
let nextId = 0;
export const snackbarMessages = readonly(messages);

export function dismissSnackbar(id: number) {
  messages.value = messages.value.filter((message) => message.id !== id);
}

// Each caller owns one notice, so retries replace it and recovery clears it.
export function useSnackbar() {
  const source = Symbol();
  let active = true;
  const dismiss = () => {
    messages.value = messages.value.filter(
      (message) => message.source !== source,
    );
  };
  onScopeDispose(() => {
    active = false;
    dismiss();
  });
  return {
    dismiss,
    show(message: string, options: SnackbarOptions = {}) {
      if (!active) return;
      dismiss();
      const notice = { ...options, id: ++nextId, source, message };
      const errors = messages.value.filter((message) => message.error);
      messages.value = options.error
        ? [notice, ...errors]
        : [...errors, notice];
    },
  };
}
