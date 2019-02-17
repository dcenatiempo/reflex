<template>
  <div class="scrollable-ul">
    <ul
        ref="ul"
        :style="`max-height: ${maxHeight}px`">
      <slot />
    </ul>
    <div class="gradient"></div>
  </div>
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
        if (!vm.$refs.ul) return;
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
.scrollable-ul {
  position: relative;
  padding: 1rem 0;
  // padding-top: 1.5rem;
  flex-grow: 1;
  flex-basis: 120px;

  ul {
    padding: 0;
    margin: 0;
    list-style-type: none;
    overflow-y: auto;
    scroll-behavior: smooth;
  }
  .gradient {
      position: absolute;
      width: 100%;
      top: 0;
      height: 2rem;
      // background: linear-gradient(to bottom, rgba(255,255,255,1) 0%,rgba(255,255,255,0) 100%); 
    }
}
</style>
