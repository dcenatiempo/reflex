<template>
  <div class="home">
    <HelloWorld msg="Hello World"/>
    The home page will have:
    <ul>
      <li>General Chat</li>
      <li>Room List</li>
      <li>Room Creation</li>
      <li>Join a room</li>
    </ul>
    Each room will have:
    <ul>
      <li>Its own chat</li>
      <li>Game Board</li>
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
