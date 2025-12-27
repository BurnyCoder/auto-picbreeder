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
  <div>
    <NavBar/>
    <EvolveOptions/>
    <ThreeColumns/>
    <ExploreCarousel/>
    <Footer/>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import EvolveOptions from '../components/EvolveOptions.vue'
import ExploreCarousel from '../components/ExploreCarousel.vue'
import ThreeColumns from '../components/ThreeColumns.vue'
import Footer from '../components/Footer.vue'

// Use Bootstrap
import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

export default {
  name: 'Homepage',
  components: {
    NavBar,
    EvolveOptions,
    ExploreCarousel,
    ThreeColumns,
    Footer,
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
