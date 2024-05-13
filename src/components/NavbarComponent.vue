<template>
  <div id="navbar-component">
  </div>
</template>

<script lang="ts">
  export default {
    data() {},
    methods: {},
  }
</script>

<style>
  #navbar-component {
    background-color: #747474; 
    color: white;
    padding: 15px 30px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); 
  }

  h1 {
    margin: 0; 
    font-size: 24px; 
    font-weight: bold;
    cursor: pointer;
  }

  h1:hover {
    color: #ccc; 
  }
</style>
