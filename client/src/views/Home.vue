<template>
  <div id="home">
    <h1>Reflex</h1>
    <enter-arena />
  </div>
</template>

<script>
// @ is an alias to /src
import EnterArena from '@/components/EnterArena'
import { mapState } from 'vuex';

export default {
  name: 'home',
  components: {
    EnterArena
  },
  data() {
    return {
    }
  },
  computed: {
    ...mapState(['currentUser']),
  },
  methods: {
  },
  mounted() {
    if (this.currentUser)
      this.$router.replace({ path: '/arena' });
  },
  watch: {},
}
</script>

<style lang="scss">
#home {
  h1 {
    font-size: 3rem;
  }
}
</style>
