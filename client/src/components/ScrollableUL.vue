<template>
  <ul
      ref="ul"
      class="scrollable-ul"
      :style="`max-height: ${maxHeight}px`">
    <slot />
  </ul>
</template>

<script>
export default {
  name: 'scrollable-ul',
  props: {
    maxHeight: {
      type: Number,
      default: 400
    },
    watchData: Array,
  },
  methods: {
    autoScroll() {
      let vm = this;
      setTimeout(() => {
        vm.$refs.ul.scrollTop = vm.$refs.ul.scrollHeight;
      }, 0);
    }
  },
  watch: {
    watchData() {
      this.autoScroll();
    }
  },
  mounted() {
    this.autoScroll();
  }
}
</script>

<style lang="scss">
ul.scrollable-ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
    overflow-y: auto;
    scroll-behavior: smooth;
}
</style>
