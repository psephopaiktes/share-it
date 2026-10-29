<script lang="ts" setup>
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import {
  CUSTOM_BUTTON_PREFIX,
  type CustomButton,
  deleteCustomButton,
  loadCustomButtons,
  renderShareUrl,
  type SharePageData,
  saveCustomButton,
  templateError,
  templateVariables,
} from "@/lib/custom-buttons";
import i18n from "@/lib/i18n";
import { useSnackbar } from "@/lib/snackbar";

const props = defineProps<{ targetId?: string; active: boolean }>();
const t = i18n.t;
const items = ref<CustomButton[]>([]);
const loaded = ref(false);
const busy = ref(false);
const editing = ref(false);
const original = ref<CustomButton>();
const draft = reactive<CustomButton>({ id: "", name: "", urlTemplate: "" });
const errors = reactive({ name: "", template: "" });
const feedback = useSnackbar();
const conflict = ref(false);
const nameInput = ref<HTMLInputElement>();
const templateInput = ref<HTMLTextAreaElement>();
const dirty = computed(
  () =>
    editing.value &&
    (draft.name !== (original.value?.name ?? "") ||
      draft.urlTemplate !== (original.value?.urlTemplate ?? "")),
);
const text = {
  guideIntro: t({
    en: "Use a service’s sharing URL and replace the values you want to send with {{variable}}.",
    ja: "共有先サービスの共有用URLを用意し、送りたい値を {{変数}} に置き換えます。",
    "zh-cn": "使用服务的分享 URL，将要发送的值替换为 {{变量}}。",
    es: "Usa la URL para compartir del servicio y sustituye los valores por {{variable}}.",
  }),
  add: t({
    en: "Add button",
    ja: "ボタンを追加",
    "zh-cn": "添加按钮",
    es: "Añadir botón",
  }),
  edit: t({ en: "Edit", ja: "編集", "zh-cn": "编辑", es: "Editar" }),
  remove: t({ en: "Delete", ja: "削除", "zh-cn": "删除", es: "Eliminar" }),
  save: t({
    en: "Save button",
    ja: "ボタンを保存",
    "zh-cn": "保存按钮",
    es: "Guardar botón",
  }),
  cancel: t({
    en: "Cancel",
    ja: "キャンセル",
    "zh-cn": "取消",
    es: "Cancelar",
  }),
  reload: t({
    en: "Reload",
    ja: "再読み込み",
    "zh-cn": "重新加载",
    es: "Recargar",
  }),
  name: t({
    en: "Button name",
    ja: "ボタン名",
    "zh-cn": "按钮名称",
    es: "Nombre del botón",
  }),
  template: t({
    en: "Sharing URL",
    ja: "共有先URL",
    "zh-cn": "分享 URL",
    es: "URL para compartir",
  }),
};
const conflictMessage = t({
  en: "This button changed in another window. Reload before saving.",
  ja: "このボタンは別の画面で変更されました。再読み込みしてから保存してください。",
  "zh-cn": "此按钮已在另一个窗口更改。请重新加载后再保存。",
  es: "Este botón cambió en otra ventana. Recarga antes de guardar.",
});
const variableHints: Record<string, string> = {
  url: t({
    en: "Page URL",
    ja: "ページのURL",
    "zh-cn": "页面 URL",
    es: "URL de la página",
  }),
  title: t({
    en: "Page title",
    ja: "ページのタイトル",
    "zh-cn": "页面标题",
    es: "Título de la página",
  }),
  ogImage: t({
    en: "OG image URL",
    ja: "OG画像のURL",
    "zh-cn": "OG 图片 URL",
    es: "URL de imagen OG",
  }),
  description: t({
    en: "Page description",
    ja: "ページの説明文",
    "zh-cn": "页面描述",
    es: "Descripción de la página",
  }),
  selection: t({
    en: "Selected text",
    ja: "選択中のテキスト",
    "zh-cn": "选中的文字",
    es: "Texto seleccionado",
  }),
  canonicalUrl: t({
    en: "Canonical URL (or page URL)",
    ja: "正規URL（なければページURL）",
    "zh-cn": "规范 URL（否则为页面 URL）",
    es: "URL canónica (o URL de la página)",
  }),
};
const exampleTemplate =
  "https://example.com/share?url={{url}}&title={{title}}&image={{ogImage}}";
const sample: SharePageData = {
  url: "https://example.com/article?lang=ja&ref=share-it",
  title: t({
    en: "An interesting article",
    ja: "気になる記事のタイトル",
    "zh-cn": "一篇有趣的文章",
    es: "Un artículo interesante",
  }),
  ogImage: "https://example.com/images/article.jpg",
  description: t({
    en: "A short page description.",
    ja: "ページの短い説明文。",
    "zh-cn": "页面的简短描述。",
    es: "Una breve descripción de la página.",
  }),
  selection: t({
    en: "A quote from the page",
    ja: "ページ内で選択した文章",
    "zh-cn": "页面中选取的文字",
    es: "Una cita de la página",
  }),
  canonicalUrl: "https://example.com/article",
  meta: { "og:site_name": "Example" },
};
const preview = computed(() => {
  try {
    return renderShareUrl(draft.urlTemplate.trim(), sample);
  } catch {
    return "";
  }
});

function canDiscard() {
  return (
    !dirty.value ||
    window.confirm(
      t({
        en: "Discard the unsaved changes?",
        ja: "未保存の変更を破棄しますか？",
        "zh-cn": "要放弃未保存的更改吗？",
        es: "¿Descartar los cambios sin guardar?",
      }),
    )
  );
}

async function edit(button?: CustomButton) {
  if (busy.value || !canDiscard()) return;
  original.value = button ? { ...button } : undefined;
  Object.assign(
    draft,
    button ?? { id: crypto.randomUUID(), name: "", urlTemplate: "" },
  );
  errors.name = errors.template = "";
  conflict.value = false;
  feedback.dismiss();
  editing.value = true;
  await nextTick();
  nameInput.value?.focus();
}

function cancel() {
  if (!canDiscard()) return;
  editing.value = false;
  feedback.dismiss();
}

function validateName() {
  errors.name =
    draft.name.trim() && draft.name.trim().length <= 60
      ? ""
      : t({
          en: "Enter a name of 1–60 characters.",
          ja: "ボタン名を1〜60文字で入力してください。",
          "zh-cn": "请输入 1–60 个字符的名称。",
          es: "Introduce un nombre de 1 a 60 caracteres.",
        });
}
function validateTemplate() {
  const issue = templateError(draft.urlTemplate.trim());
  errors.template =
    issue === "variable"
      ? t({
          en: "Check the {{ }} syntax and use a variable from the guide.",
          ja: "{{ }} の書き方と変数名を確認してください。使える変数は右側（狭い画面では下）のガイドにあります。",
          "zh-cn": "请检查 {{ }} 语法并使用指南中的变量。",
          es: "Revisa la sintaxis {{ }} y utiliza una variable de la guía.",
        })
      : issue === "destination"
        ? t({
            en: "Keep the destination domain fixed; use variables in the path or parameters.",
            ja: "共有先のドメインは固定し、変数はパスやパラメータに指定してください。",
            "zh-cn": "请固定目标域名，在路径或参数中使用变量。",
            es: "Mantén fijo el dominio y usa variables en la ruta o los parámetros.",
          })
        : issue
          ? t({
              en: "Enter an HTTP, HTTPS or mailto URL of up to 2,048 characters.",
              ja: "HTTP・HTTPS・mailto のURLを2,048文字以内で入力してください。",
              "zh-cn":
                "请输入不超过 2,048 个字符的 HTTP、HTTPS 或 mailto URL。",
              es: "Introduce una URL HTTP, HTTPS o mailto de hasta 2.048 caracteres.",
            })
          : "";
}

let revision = 0;
async function load(force = false) {
  const request = ++revision;
  try {
    const next = await loadCustomButtons(browser.storage.sync);
    if (request !== revision) return false;
    if (editing.value && original.value) {
      const current = next.find((item) => item.id === draft.id);
      if (JSON.stringify(current) !== JSON.stringify(original.value)) {
        if (dirty.value && !force) {
          if (!conflict.value) showConflict();
        } else if (current) {
          original.value = { ...current };
          Object.assign(draft, current);
        } else editing.value = false;
      }
    }
    items.value = next;
    loaded.value = true;
    if (force) conflict.value = false;
    if (!conflict.value) feedback.dismiss();
    return true;
  } catch {
    showError(undefined, () => load(force));
    return false;
  }
}

function showConflict() {
  conflict.value = true;
  feedback.show(`${draft.name}: ${conflictMessage}`, {
    error: true,
    action: { label: text.reload, run: () => load(true) },
  });
}

function showError(reason?: unknown, retry: () => unknown = () => load(true)) {
  if (reason instanceof Error && reason.message === "limit") {
    feedback.show(
      t({
        en: "You can save up to 50 custom buttons. Delete a button before adding another.",
        ja: "カスタムボタンは50件まで保存できます。不要なボタンを削除してから追加してください。",
        "zh-cn": "最多可保存 50 个自定义按钮。请先删除一个按钮。",
        es: "Puedes guardar hasta 50 botones. Elimina uno antes de añadir otro.",
      }),
      { error: true },
    );
    return;
  }
  if (reason instanceof Error && reason.message === "conflict") {
    showConflict();
  } else
    feedback.show(
      t({
        en: "Could not save or load custom buttons. Check your connection and Sync storage space, then try again.",
        ja: "カスタムボタンを保存・読み込みできませんでした。接続やブラウザ同期の空き容量を確認して、もう一度お試しください。",
        "zh-cn": "无法保存或加载自定义按钮。请检查连接和同步存储空间后重试。",
        es: "No se pudieron guardar o cargar los botones. Comprueba la conexión y el espacio de sincronización e inténtalo de nuevo.",
      }),
      {
        error: true,
        action: {
          label: t({
            en: "Retry",
            ja: "再試行",
            "zh-cn": "重试",
            es: "Reintentar",
          }),
          run: retry,
        },
      },
    );
}

async function save() {
  if (busy.value || !loaded.value || conflict.value) return;
  validateName();
  validateTemplate();
  if (errors.name || errors.template) {
    await nextTick();
    (errors.name ? nameInput.value : templateInput.value)?.focus();
    return;
  }
  busy.value = true;
  try {
    const button = await saveCustomButton(
      browser.storage.sync,
      { ...draft },
      original.value,
    );
    editing.value = false;
    if (await load())
      feedback.show(
        t({
          en: "Button saved.",
          ja: "ボタンを保存しました。",
          "zh-cn": "按钮已保存。",
          es: "Botón guardado.",
        }),
        {
          action: {
            label: t({
              en: "Open Edit buttons",
              ja: "ボタン編集を開く",
              "zh-cn": "打开编辑按钮",
              es: "Abrir Editar botones",
            }),
            run: () => {
              window.location.hash = "buttons";
              feedback.dismiss();
            },
          },
        },
      );
    await nextTick();
    document.getElementById(`custom-edit-${button.id}`)?.focus();
  } catch (reason) {
    showError(reason, save);
  } finally {
    busy.value = false;
  }
}

async function remove(button: CustomButton) {
  if (
    busy.value ||
    !window.confirm(
      t({
        en: `Delete “${button.name}”?`,
        ja: `「${button.name}」を削除しますか？`,
        "zh-cn": `要删除“${button.name}”吗？`,
        es: `¿Eliminar «${button.name}»?`,
      }),
    )
  )
    return;
  busy.value = true;
  try {
    await deleteCustomButton(browser.storage.sync, button);
    if (draft.id === button.id) editing.value = false;
    if (await load())
      feedback.show(
        t({
          en: "Button deleted.",
          ja: "ボタンを削除しました。",
          "zh-cn": "按钮已删除。",
          es: "Botón eliminado.",
        }),
      );
  } catch (reason) {
    showError(reason, () => remove(button));
  } finally {
    busy.value = false;
  }
}

async function insert(variable: string) {
  const input = templateInput.value;
  if (!input) return;
  const start = input.selectionStart;
  const end = input.selectionEnd;
  const token = `{{${variable}}}`;
  draft.urlTemplate =
    draft.urlTemplate.slice(0, start) + token + draft.urlTemplate.slice(end);
  errors.template = "";
  await nextTick();
  input.focus();
  input.setSelectionRange(start + token.length, start + token.length);
}

function onStorageChanged(changes: Record<string, unknown>, area: string) {
  if (
    area === "sync" &&
    !busy.value &&
    Object.keys(changes).some((key) => key.startsWith(CUSTOM_BUTTON_PREFIX))
  )
    void load();
}
watch(
  [() => props.targetId, () => props.active, loaded],
  ([id, active, ready]) => {
    if (!id || !active || !ready || (editing.value && draft.id === id)) return;
    const button = items.value.find((item) => item.id === id);
    if (button) void edit(button);
  },
);
onMounted(() => {
  browser.storage.onChanged.addListener(onStorageChanged);
  void load();
});
onUnmounted(() => {
  ++revision;
  browser.storage.onChanged.removeListener(onStorageChanged);
});
</script>

<template>
  <div class="customButtons">
    <div class="intro">
      <p>{{ t({
        en: 'Add your own sharing destinations. Saved buttons appear in Edit buttons, where you can reorder or turn them on and off.',
        ja: '共有先URLを自由に設定できます。保存後は「ボタン編集」で並び替え・ON/OFFできます。',
        'zh-cn': '添加专属分享目标。保存后可在“编辑按钮”中排序或启用、禁用。',
        es: 'Añade tus propios destinos. Los botones guardados aparecen en Editar botones, donde puedes ordenarlos o activarlos y desactivarlos.',
      }) }}</p>
      <button v-if="items.length && !editing" type="button" class="primary" :disabled="!loaded || busy" @click="edit()"><span aria-hidden="true">＋</span> {{ text.add }}</button>
    </div>
    <button v-if="!loaded || conflict" type="button" class="reloadSettings" :disabled="busy" @click="load(true)">{{ text.reload }}</button>

    <div class="workspace">
      <div class="content">
        <section v-if="editing" class="editor" aria-labelledby="custom-editor-heading">
          <h2 id="custom-editor-heading">{{ original ? t({ en: 'Edit custom button', ja: 'カスタムボタンを編集', 'zh-cn': '编辑自定义按钮', es: 'Editar botón personalizado' }) : text.add }}</h2>
          <form novalidate @submit.prevent="save">
            <fieldset :disabled="busy || conflict || !loaded">
              <div class="field">
                <label for="custom-button-name">{{ text.name }}</label>
                <input id="custom-button-name" ref="nameInput" v-model="draft.name" name="name" maxlength="60" required autocomplete="off" :aria-invalid="errors.name ? true : undefined" :aria-describedby="errors.name ? 'custom-name-error' : undefined" @blur="validateName" @input="errors.name = ''" />
                <p v-if="errors.name" id="custom-name-error" role="alert" class="error">{{ errors.name }}</p>
              </div>
              <div class="field">
                <label for="custom-button-template">{{ text.template }}</label>
                <textarea id="custom-button-template" ref="templateInput" v-model="draft.urlTemplate" name="urlTemplate" rows="4" maxlength="2048" required spellcheck="false" :placeholder="exampleTemplate" :aria-invalid="errors.template ? true : undefined" :aria-describedby="errors.template ? 'custom-template-hint custom-template-error' : 'custom-template-hint'" @blur="validateTemplate" @input="errors.template = ''" />
                <p id="custom-template-hint" class="muted">{{ t({ en: 'Use an HTTP, HTTPS or mailto sharing URL. Variables are automatically URL-encoded.', ja: 'HTTP・HTTPS・mailto の共有用URLを指定できます。変数の値はURL用に自動エンコードされます。', 'zh-cn': '使用 HTTP、HTTPS 或 mailto 分享 URL。变量值会自动进行 URL 编码。', es: 'Usa una URL HTTP, HTTPS o mailto. Los valores se codifican automáticamente para la URL.' }) }}</p>
                <p v-if="errors.template" id="custom-template-error" role="alert" class="error">{{ errors.template }}</p>
                <div class="insertions" :aria-label="t({ en: 'Insert a variable', ja: '変数を挿入', 'zh-cn': '插入变量', es: 'Insertar una variable' })">
                  <button v-for="variable in templateVariables" :key="variable" type="button" :title="variableHints[variable]" @mousedown.prevent @click="insert(variable)"><code v-text="`{{${variable}}}`" /></button>
                </div>
              </div>
              <details class="preview">
                <summary>{{ t({ en: 'Preview with sample page data', ja: 'サンプルページでの展開プレビュー', 'zh-cn': '使用示例页面数据预览', es: 'Vista previa con datos de ejemplo' }) }}</summary>
                <p class="muted">{{ t({ en: 'This example uses sample data, not the page you are viewing.', ja: '以下はサンプルデータでの例です。現在のページの情報ではありません。', 'zh-cn': '此示例使用示例数据，而不是当前页面的信息。', es: 'Este ejemplo usa datos de muestra, no los de la página actual.' }) }}</p>
                <code v-if="preview" class="previewUrl">{{ preview }}</code>
                <p v-else class="muted">{{ t({ en: 'Enter a valid sharing URL to see its preview.', ja: '共有先URLを入力すると、変数を置き換えたURLを確認できます。', 'zh-cn': '输入有效的分享 URL 即可预览。', es: 'Introduce una URL válida para ver la vista previa.' }) }}</p>
              </details>
              <div class="formActions"><button type="submit" class="primary">{{ text.save }}</button><button type="button" @click="cancel">{{ text.cancel }}</button></div>
            </fieldset>
          </form>
        </section>

        <div v-if="!items.length && !editing && loaded" class="empty">
          <img src="/img/link.svg" alt="" width="32" height="32" />
          <h2>{{ t({ en: 'No custom buttons yet', ja: 'カスタムボタンはまだありません', 'zh-cn': '还没有自定义按钮', es: 'Aún no hay botones personalizados' }) }}</h2>
          <p class="muted">{{ t({ en: 'Start with a service’s sharing URL and add the page information you want to send.', ja: 'サービスの共有用URLに、送りたいページ情報を組み合わせて作成できます。', 'zh-cn': '将服务的分享 URL 与要发送的页面信息组合起来。', es: 'Combina la URL de un servicio con la información que quieras enviar.' }) }}</p>
          <button type="button" class="primary" @click="edit()">{{ text.add }}</button>
        </div>

        <ul v-if="items.length" class="savedButtons">
          <li v-for="button in items" :key="button.id">
            <div class="rowSymbol"><img src="/img/link.svg" alt="" width="20" height="20" /></div>
            <div class="rowLabel"><h2>{{ button.name }}</h2><p :title="button.urlTemplate">{{ button.urlTemplate }}</p></div>
            <div class="rowActions">
              <button :id="`custom-edit-${button.id}`" type="button" :disabled="busy" :aria-label="`${button.name}: ${text.edit}`" @click="edit(button)">{{ text.edit }}</button>
              <button type="button" class="delete" :disabled="busy" :aria-label="`${button.name}: ${text.remove}`" @click="remove(button)">{{ text.remove }}</button>
            </div>
          </li>
        </ul>
      </div>

      <aside class="guide" aria-labelledby="custom-guide-heading">
        <h2 id="custom-guide-heading">{{ t({ en: 'How to set up a button', ja: '設定のヒント', 'zh-cn': '设置指南', es: 'Cómo configurar un botón' }) }}</h2>
        <p>{{ text.guideIntro }}</p>
        <dl><template v-for="variable in templateVariables" :key="variable"><dt><code v-text="`{{${variable}}}`" /></dt><dd>{{ variableHints[variable] }}</dd></template></dl>
        <p>{{ t({ en: 'Other meta tags are available too:', ja: 'ほかのメタタグも指定できます：', 'zh-cn': '也可以指定其他 meta 标签：', es: 'También puedes usar otras etiquetas meta:' }) }} <code v-text="'{{meta:og:site_name}}'" /></p>
        <p class="muted">{{ t({ en: 'OG images are sent as image URLs, not uploaded files. Missing values become empty text. Protected browser pages may only provide a URL and title.', ja: 'OG画像は画像ファイルではなくURLを渡します。取得できない値は空欄になります。ブラウザの設定ページなどでは、URLとタイトルだけ取得できる場合があります。', 'zh-cn': 'OG 图片以 URL 而非上传文件的形式发送。缺失的值为空。受保护的浏览器页面可能只提供 URL 和标题。', es: 'La imagen OG se envía como URL, no como archivo. Los valores ausentes quedan vacíos. Las páginas protegidas pueden ofrecer solo URL y título.' }) }}</p>
        <p class="muted">{{ t({ en: 'Up to 50 custom buttons can be saved.', ja: 'カスタムボタンは50件まで保存できます。', 'zh-cn': '最多可保存 50 个自定义按钮。', es: 'Puedes guardar hasta 50 botones personalizados.' }) }}</p>
        <div class="example">
          <h3>{{ t({ en: 'Example', ja: '設定例', 'zh-cn': '示例', es: 'Ejemplo' }) }}</h3>
          <code class="exampleUrl" v-text="exampleTemplate" />
          <button v-if="editing" type="button" :disabled="busy || conflict" @click="draft.urlTemplate = exampleTemplate; errors.template = ''">{{ t({ en: 'Use this example', ja: 'この例を入力', 'zh-cn': '使用此示例', es: 'Usar este ejemplo' }) }}</button>
          <p class="muted">{{ t({ en: 'Replace example.com with your service’s sharing endpoint. Keep the domain fixed and put variables in the path or query. Use %0A for a line break.', ja: 'example.com の部分は利用するサービスの共有先に変更してください。ドメインは固定し、変数はパスやパラメータに指定します。改行は %0A で指定できます。', 'zh-cn': '请将 example.com 替换为服务的分享地址。域名固定，变量放在路径或参数中。换行使用 %0A。', es: 'Sustituye example.com por el destino del servicio. Mantén fijo el dominio y usa variables en la ruta o consulta. Usa %0A para un salto de línea.' }) }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.customButtons { max-width: 1200px; padding-bottom: 48px; }
.intro { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 20px; margin-bottom: 28px; }
.intro > p { max-width: 640px; color: rgb(var(--color-main) / .7); }
.workspace { display: grid; grid-template-columns: minmax(0, 1fr); gap: 28px; align-items: start; }
.content { min-width: 0; }
h2 { font-size: 18px; font-weight: 600; }
button { padding: 9px 16px; border: 1px solid rgb(var(--color-main) / .18); border-radius: 6px; color: inherit; font: inherit; }
button:disabled { opacity: .5; cursor: default; }
button.primary { background: rgb(var(--color-theme)); border-color: transparent; color: rgb(var(--color-base)); }
button.primary:hover:not(:disabled) { background: rgb(var(--color-theme) / .9); }
.muted { color: rgb(var(--color-main) / .65); font-size: 13px; }
.error { color: #b3261e; margin-block: 8px; }
a { color: rgb(var(--color-theme)); text-underline-offset: 3px; }
.editor { padding: 24px; border: 1px solid rgb(var(--color-theme) / .3); border-radius: 12px; margin-bottom: 24px; }
fieldset { border: 0; min-width: 0; }
.field { margin-top: 24px; }
label { display: block; margin-bottom: 8px; font-weight: 600; }
input, textarea { width: 100%; min-width: 0; padding: 10px 12px; border: 1px solid rgb(var(--color-main) / .3); border-radius: 6px; background: rgb(var(--color-base)); color: inherit; font: inherit; }
textarea { font-family: ui-monospace, monospace; line-height: 1.6; resize: vertical; min-height: 112px; }
.field > p { margin-top: 8px; }
.insertions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
.insertions button { padding: 5px 10px; border-radius: 999px; font-size: 12px; }
code { font-family: ui-monospace, monospace; font-size: .9em; }
.preview { margin-top: 24px; padding-block: 16px; border-block: 1px solid rgb(var(--color-main) / .1); }
summary { cursor: pointer; font-weight: 600; }
.preview p { margin-top: 12px; }
.previewUrl, .exampleUrl { display: block; overflow-wrap: anywhere; white-space: pre-wrap; margin-top: 12px; line-height: 1.7; }
.formActions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 24px; }
.empty { border: 1px solid rgb(var(--color-main) / .12); border-radius: 12px; padding: 40px 24px; text-align: center; }
.empty > img { display: block; margin: 0 auto 20px; opacity: .65; }
.empty p { max-width: 420px; margin: 12px auto 24px; }
.savedButtons { list-style: none; border: 1px solid rgb(var(--color-main) / .12); border-radius: 12px; }
.savedButtons li { display: flex; align-items: center; gap: 12px; padding: 20px; }
.savedButtons li + li { border-top: 1px solid rgb(var(--color-main) / .1); }
.rowSymbol { display: grid; place-items: center; flex-shrink: 0; width: 40px; height: 40px; background: rgb(var(--color-theme) / .08); border-radius: 8px; }
.rowLabel { flex: 1; min-width: 0; }
.rowLabel h2 { font-size: 15px; overflow-wrap: anywhere; }
.rowLabel p { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; color: rgb(var(--color-main) / .6); margin-top: 4px; }
.rowActions { display: flex; gap: 6px; flex-shrink: 0; }
.rowActions button { padding: 6px 10px; }
.rowActions .delete { border-color: transparent; color: rgb(var(--color-main) / .6); }
.guide { min-width: 0; padding: 24px; border-radius: 12px; background: rgb(var(--color-main) / .035); }
.guide > p { margin-top: 16px; }
.guide dl { margin-top: 20px; display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 12px; align-items: baseline; }
.guide dt { color: rgb(var(--color-theme)); }
.guide dd { font-size: 13px; }
.guide code { overflow-wrap: anywhere; }
.example { border-top: 1px solid rgb(var(--color-main) / .12); margin-top: 24px; padding-top: 20px; }
.example h3 { font-size: 14px; }
.example button, .example p { margin-top: 12px; }
@media (min-width: 1200px) { .workspace { grid-template-columns: minmax(0, 1fr) 300px; } }
@media (max-width: 600px) {
  .editor, .guide { padding: 20px 16px; }
  .savedButtons li { padding: 16px; flex-wrap: wrap; }
  .rowActions { width: 100%; justify-content: flex-end; }
  .guide dl { column-gap: 8px; }
}
@media (prefers-color-scheme: dark) {
  .error { color: #ffb4ab; }
  .empty > img, .rowSymbol img { filter: invert(1); }
}
</style>
