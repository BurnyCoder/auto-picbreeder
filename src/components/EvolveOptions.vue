<template>
    <!-- NavBar starts here -->
    <div id='megaLinkContainer'>
          <router-link to="/evolve" tag="div" id='newuser' class='megaLink'>
            New User
            <div class="overlay">
                <div class="overlaytext">Start Evolving</div>
            </div>
        </router-link>
        <router-link to="/evolve" tag="div" id='returninguser' class='megaLink'>
            Returning User
            <div class="overlay">
                <div class="overlaytext">Start Evolving</div>
            </div>
        </router-link>
    </div>
</template>

<script>
    export default {
    name: 'EvolveOptions'
    }
</script>

<!-- Component-specific CSS -->
<style>
#megaLinkContainer {
    display: flex;
    justify-content: space-evenly;
    margin-top: 20px;
    width: 100%;
    height: 300px;
}

.megaLink {
    background-size: cover;
    background-color: black;
    height: 300px;
    width: 45vw;
}

@keyframes mymove {
   0%  {background-position: left top;}
  25%  {background-position: right top;}
  50%  {background-position: right bottom;}
  75%  {background-position: left bottom;}
  100% {background-position: left top;}
}

.overlay{
  position: absolute;
  top: 84px;
  height: 300px;
  width: 45vw;
  opacity: 0;
  transition: .5s ease;
  background-color: #B0F5BA;
  transition: .5s ease;
}

.megaLink:hover .overlay {
  opacity: 0.95;
  cursor:pointer;
}
.megaLink:hover .returninguser {
  opacity: 0.75;
}
.megaLink:hover .newuser {
  opacity: 0.75;
}

#newuser {
    color: white;
    font-size: 120px;
    font-variant: small-caps;
    vertical-align: middle;
    text-align: center;
    line-height: .9;
    background-image: url(../assets/slime.png);
    background-position: left top;
    background-size: 125%;
    animation: mymove 45s infinite;
}

#returninguser {
    color: white;
    font-size: 120px;
    font-variant: small-caps;
    vertical-align: middle;
    text-align: center;
    line-height: .9;
    background-image: url(../assets/stripes.png);
    background-position: left top;
    background-size: 125%;
    animation: mymove 45s infinite;
}

.overlaytext {
  color: white;
  font-size: 60px;
  position: absolute;
  bottom: 0px;
  font-variant: small-caps;
  text-align: center;
}


</style>