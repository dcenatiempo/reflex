<template>
  <div class="home">
    <HelloWorld msg="Hello World"/>
    The home page will have:
    <ul>
      <li>Description</li>
      <li>Form to enter user name</li>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue'

export default {
  name: 'home',
  components: {
    HelloWorld
  }
}
</script>
