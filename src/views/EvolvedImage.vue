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
  <div class="evolvedImage">
    <NavBar/>
    <div id="imageTitle">Image {{ $route.params.id }}</div>
    <div id="aboutImageContainer">
      <div id="imageContainer">
        <img id="selectedImage" :src="photoURL"/>
      </div>
      <div id="aboutImage">
      About This Image
      <div id="rating"><div id="ratingTitle">Rating:</div><div class="star rated" id="firstStar"></div><div class="star rated" id="secondStar"></div><div class="star rated" id="thirdStar"></div><div class="star rated" id="fourthStar"></div><div class="star" id="fifthStar"></div></div>
      <div id="creator" class="info"><div class="infoTitle">Created By:</div> John Doe</div>
      <div id="dateCreated" class="info"><div class="infoTitle">Date Created:</div> 8/27/2019</div>
      <div id="description" class="info">An image description goes here. Because this is a dummy image, the description currently contains dummy text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras sit amet libero vitae magna aliquam lobortis. Maecenas a molestie dui, hendrerit finibus arcu. Aenean quis odio ac leo hendrerit consectetur. Vivamus lacinia eros luctus interdum tristique. Aliquam tincidunt, quam a tempor maximus, mauris ex porttitor arcu, in semper velit ex quis magna.</div>
      <div id="tagContainer" class="info"><div class="infoTitle">Tags:</div> <div class="tag">#dummyimage</div> <div class="tag">#sample</div> <div class="tag">#lorem</div> <div class="tag">#ipsum</div> <div class="tag">#example</div></div>
      </div>
    </div>
    <Footer/>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'EvolvedImage',
  components: {
    NavBar,
    Footer,
  },
  computed: {
    photoURL: function () {
      // Calculates the URL for the image file
      return require("../assets/".concat(this.$route.params.id, ".png"))
    }
  }
}
</script>

<style>
#imageTitle {
  width: 100%;
  font-size: 30px;
}
#aboutImageContainer {
  display: flex;
  text-align: left;
}
#selectedImage {
  margin-top: 10px;
  margin-left: 5vw;
  height: 25vw;
  width: 25vw;
}
#aboutImage {
  width: 55vw;
  font-size: 26px;
  margin-left: 2vw;
}
#rating {
  display: flex;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 18px;
  align-items: center;
}
.star {
  width: 26px;
  height: 26px;
  background-image: url(../assets/light-gray-star.svg);
  background-size: contain;
  margin-left: 2px;
  margin-top: -6px;
}
.rated {
  background-image: url(../assets/dark-gray-star.svg);
}
#rating:hover > .star {
  background-image: url(../assets/user-star.svg);
  cursor: pointer;
}
#rating:hover > .star:hover ~ .star {
  background-image: url(../assets/light-gray-star.svg);
}
#ratingTitle {
  margin-right: 5px;
}
#tagContainer {
  display: flex;
}
.tag {
  color: #7f7f7f;
  margin-left: 7px;
}
.tag:hover {
  cursor: pointer;
  color: #5f79c4;
}
.info {
  font-size: 16px;
  margin-top: 5px;
}
.infoTitle {
  font-weight: bold;
}
</style>