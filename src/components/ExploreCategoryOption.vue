<template>
  <div class="category">
    <router-link :to="evolvedImageURL">
    <b-card
        :img-src="photoURL"
        :img-alt="imgSource"
        img-top=true
        overlay=true
        style="max-width: 11rem; margin: auto"
        class="mb-2"
        :to="evolvedImageURL"
    >
    </b-card>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ExploreCategoryOption',
  props: ["imgSource"], // The id associated with the image
  computed: {
    photoURL: function () {
      // `this` points to the vm instance
      // Calculates the URL for the image files
      return require("../assets/".concat(this.imgSource, ".png"))
    },
    evolvedImageURL: function () {
      // Calculates the URL for the image's page
      return "/image/".concat(this.imgSource)
    },
  },
}
</script>

<style>
.card-body {
  padding: 0;
}

.card-text {
  color: white;
  background-color: #363636;
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: .2s linear;
}

.card-text:hover {
  opacity: .9;
}

.card {
  border: none;
}

.card img {
  border-radius: 0px;
}

.card:first-child {
  margin-left: 0px !important;
}
</style>