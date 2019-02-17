<template>
  <form v-on:submit.prevent="handleInput" class="button-input">
    <input
        type="text"
        :placeholder="placeholder"
        v-model="input"
        v-on:keyup.enter="handleInput" />
    <button
        class="btn"
        :disabled="isDisabled"
        @click="handleInput">
      {{buttonText}}
    </button>
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
    },
    maxLength: {
      type: Number,
      default: 255,
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      input: '',
    };
  },
  computed: {
    isDisabled() {
      if (this.input.length <= 0 || this.disabled) return true;
      return false;
    },
  },
  watch: {
    input() {
      this.$emit('input', this.input);
      if (this.input.length >= this.maxLength) {
        this.input = this.input.substring(0, this.maxLength);
      }
    }
  },
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
    padding: 1rem;
    border-radius: 5px 0 0 5px;
    background: rgb(240, 240, 240);
    font-size: 1rem;
  }
  button {
    flex-grow: 1;
    flex-basis: 50px;
    background: rgb(255, 180, 18);
    color: white;
    border-radius: 0 5px 5px 0;
  }
}
</style>
