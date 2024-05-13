<template>
  <div id="app">
    <div class="main-content">
      <div class="header">
        <NavbarComponent />
        <img alt="Doge" src="./assets/happy.png" />
        <h1>GageSaw</h1>
      </div>
      <GraphComponent ref="graphComponentRef" class="graph-component" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import GraphComponent from './components/GraphComponent.vue'
  import NavbarComponent from './components/NavbarComponent.vue'
  import { ref } from 'vue'

  const graphComponentRef = ref(null)
</script>

<style scoped>
  #app {
    font-family: 'Ariel', Helvetica, Arial, sans-serif; 
    color: #333; 
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    padding-top: 60px; 
    background-color: rgb(62, 62, 62);
  }

  .main-content {
    max-width: 1200px; 
    margin: 20px auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .header img {
    height: 80px; 
  }

  .header {
    text-align: center;
    margin-bottom: 20px; 
  }

  .graph-component {
    flex: 1; 
    width: 100%; /* Full width within container */
  }
  h1 {
    color: whitesmoke;
  }
  h1 :hover {
    color: black;
  }
</style>
