<template>
  <VButton
    img="/img/copy.svg"
    @click="copy()"
  >
    {{ $store.state.isEn ? 'Copy title' : 'タイトルをコピー' }}
  </VButton>
</template>

<script>
export default {
  name: 'CopyTitle',
  methods:{
    copy() {
      navigator.clipboard.writeText(this.$store.state.tab.title);
      this.copyNotification(this.$store.state.isEn);
    }
  }
}
</script>
