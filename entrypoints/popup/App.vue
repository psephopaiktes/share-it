<script lang="ts" setup>
import { onBeforeMount, ref } from "vue";
import ButtonList from "@/components/ButtonList.vue";
import $store from "./store";

const title = ref("Example site");
const url = ref("https://example.com");
const favIconUrl = ref("https://hira.page/img/meta/favicon.svg");

const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await browser.tabs.query(queryOptions);
  return tab;
};

const handleKeyNavigation = (event: KeyboardEvent) => {
  if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

  const focusableButtons = Array.from(
    document.querySelectorAll("button, a"),
  ).filter((el): el is HTMLElement => {
    const style = getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
  if (focusableButtons.length === 0) return;

  const activeElement = document.activeElement as HTMLElement | null;
  if (!activeElement || !focusableButtons.includes(activeElement)) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusableButtons[0].focus();
    }
    return;
  }

  const currentIndex = focusableButtons.indexOf(activeElement);
  if (currentIndex === -1) return;

  event.preventDefault();

  const nextIndex =
    event.key === "ArrowDown"
      ? (currentIndex + 1) % focusableButtons.length
      : (currentIndex - 1 + focusableButtons.length) % focusableButtons.length;

  focusableButtons[nextIndex].focus();
};

onBeforeMount(() => {
  getCurrentTab().then((tab) => {
    $store.tab = tab;

    title.value = tab.title || "";
    url.value = tab.url || "";
    favIconUrl.value = tab.favIconUrl || "";
  });

  document.addEventListener("keydown", handleKeyNavigation);
});
</script>

<template>
  <header v-if="favIconUrl || title || url">
    <img v-if="favIconUrl" :src="favIconUrl" alt="favicon">
    <h1 v-if="title && favIconUrl">{{ title }}</h1>
    <h1 v-else-if="title" class="solo">{{ title }}</h1>
    <p v-if="url">{{ url }}</p>
  </header>

  <ButtonList />
</template>

<style scoped>
header {
  padding: 20px 24px 16px;
  border-bottom: 1px solid rgb(var(--color-main) / 0.1);

  img {
    vertical-align: top;
    width: 24px;
    height: 24px;
  }

  h1 {
    margin-top: -26px;
    line-height: 26px;
    text-indent: 28px;
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    font-size: 18px;
    font-weight: 600;

    &.solo {
      margin-top: 4px;
      text-indent: 0;
    }
  }

  p {
    margin-top: 4px;
    color: rgb(var(--color-main) / 0.5);
    font-size: 12px;
    display: -webkit-box;
    overflow: hidden;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}
</style>
