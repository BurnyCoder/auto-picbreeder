<!-- 
Southwestern University Computer Science Capstone - Spring 2020

Nicholai Benko
Bennet Leff
Cameron Henkel
Sarah Friday
Jaden Williams
Anna Krolikowski
-->

<template>
  <div class="evolve">
    <NavBar/>
    <Grid/>
    <Footer/>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'
import Grid from '../components/EvolveGrid.vue'

export default {
  name: 'Evolve',
  components: {
    NavBar,
    Footer,
    Grid,
  }
}
</script>

<style>
</style>