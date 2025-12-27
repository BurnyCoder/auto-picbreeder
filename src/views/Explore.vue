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
  <div class="explore">
    <NavBar/>
    <explore-carousel/>
    <explore-filter/>
    <Footer/>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'
import ExploreCarousel from '../components/ExploreCarousel.vue'
import ExploreFilter from '../components/ExploreFilter.vue'

export default {
  name: 'Explore',
  components: {
    NavBar,
    Footer,
    ExploreCarousel,
    ExploreFilter,
  }
}
</script>

<style>
</style>