<template>
  <form v-on:submit.prevent="handleInput" class="button-input">
    <input v-model="input" type="text" :placeholder="placeholder" v-on:keyup.enter="handleInput" />
    <button :disabled="disabled" @click="handleInput">{{buttonText}}</button>
  </form>
</template>

<script>
// import { mapState, mapGetters, mapMutations, mapActions } from 'vuex';
export default {
  name: 'button-input',
  components: {},
  props: {
    placeholder: {
      type: String,
      default: '',
    },
    buttonText: {
      type: String,
      default: 'Submit',
    }
  },
  data() {
    return {
      input: '',
    };
  },
  computed: {
    disabled() {
      if (this.input.length <= 0) return true;
      return false;
    },
  },
  watch: {},
  methods: {
    handleInput() {
      if (this.input.length <= 0) return;
      this.$emit('submit', this.input);
      this.input = '';
    }
  },
  mounted() {},
}
</script>

<style lang="scss">
.button-input {
  display: flex;
  flex-flow: row wrap;

  input {
    flex-grow: 4;
    flex-basis: 100px;
    border: none;
    padding: 1em;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    background: rgb(240, 240, 240);
    font-size: 1em;
  }
  button {
    flex-grow: 1;
    flex-basis: 50px;
    border: none;
    background: rgb(255, 180, 18);
    color: white;
    border-bottom-right-radius: 5px;
    border-top-right-radius: 5px;
    font-size: 1em;
    transition: all ease 300ms;

    &[disabled] {
      background: rgb(218, 218, 218);
      color: rgb(255, 255, 255);
    }
  }
}
</style>
