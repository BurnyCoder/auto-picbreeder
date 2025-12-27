<template>
    <div>
        <h3>Explore</h3>
        <hooper :settings="hooperSettings">
            <slide v-for="(slide, i) in 24" :key="i" :index="i">
                <ExploreCategoryOption :imgSource="slide"/>
            </slide>
            <hooper-navigation slot="hooper-addons"></hooper-navigation>
        </hooper>
    </div>
</template>

<script>
import {
  Hooper,
  Slide,
  Navigation as HooperNavigation
  } from 'hooper';
import 'hooper/dist/hooper.css';
import ExploreCategoryOption from './ExploreCategoryOption.vue'

export default {
  name: 'ExploreCarousel',
  components: {
    Hooper,
    Slide,
    HooperNavigation,
    ExploreCategoryOption,
  },
  data() {
    return {
      hooperSettings: {
        itemsToShow: 8,
        itemsToSlide: 8,
      }
    };
  }
};
</script>

<!-- Component-specific CSS -->
<style>
/* Carousel adjusts to height of slide items */
.hooper{
height:auto !important;
}

.hooper-list {
  width: calc(100% - 112px);
  margin: 0 56px;
}
</style>