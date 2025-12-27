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
  <div class="about">
    <NavBar/>
    <div id="aboutText">
      <div id="aboutTitle" class="header"><img alt="About Picbreeder" src="../assets/about-picbreeder.gif"></div>
      <div class="header">Who came up with Picbreeder?</div>
      Picbreeder is based on an idea from Jimmy Secretan, who was a graduate student in the School of Electrical Engineering and Computer Science at the University of Central Florida at the time. He proposed his original idea in a meeting of the Evolutionary Complexity Research Group (EPlex) in Spring of 2006. Its inspiration was sufficiently groundbreaking that four other EECS graduate students (Nick Beato, David D'Ambrosio, Adam Campbell, and Adelein Rodriguez) volunteered to work with Jimmy and under the supervision of Dr. Kenneth Stanley (who supervises the EPlex Group) for over a year to realize this vision for the world's largest online collaborative evolution experiment. This website is the result of that effort.
      <div class="header">Who evolved all the images on the website?</div>
      The users! Anyone who has an account on Picbreeder can evolve images from scratch or branch from any of the existing images. We do not modify or curate images that have been created in any way, so all the images that you see were evolved and rated by your fellow Picbreeder users.
      <div class="header">How do tags and ratings work?</div>
      You are able to search for images that have certain qualities using tags, which are added to each image by its creator. All images can be rated by other users once they have been created and those ratings can be seen on each image.
      <div class="header">Who can use Picbreeder?</div>
      Anyone! Picbreeder utilizes powerful AI to generate images, but its interface is designed to make it accessible to computer scientists and everyday Internet users alike. Having a variety of users increases the number of new, creative, and interesting images on the site. Our goal is for Picbreeder to feel easy to use and open to everyone.
      <div class="header">What inspired Picbreeder?</div>
      The idea was inspired by a recent proliferation of "NEAT-based Genetic Art" programs in 2006 and before, which we had been discussing in the EPlex group. NEAT stands for NeuroEvolution of Augmenting Topologies, which is a method for artificially evolving neural networks on computers developed by Ken Stanley when he was a student at the University of Texas at Austin. Prior to Picbreeder, Ken also helped lead the development of an interactively evolutionary video game based on NEAT called NERO. While Genetic Art has been around for many years (for example see Karl Sims), the idea that NEAT-evolved neural networks can be used to produce pictures originated with Mattias Fagerlund in his DelphiNEAT-based Genetic Art program (DNGA). DNGA allowed the user to interactively evolve pictures that are drawn by NEAT neural networks.
      <br/><br/>While DNGA (in its initial release) produced only black and white images, it exhibited a remarkable property: It was actually possible to evolve images that look like known objects. While prior genetic art systems often produced beautiful images, they were often abstract and difficult to relate to the real world. DNGA, on the other hand, could produce images reminiscent of real things. One reason for this capability is the process of complexification implemented by NEAT, which means that the neural networks become larger and more complex as they evolve. This process means that the user can start with a simple image that captures a general idea and then refine and elaborate on it through evolution, allowing objects like spaceships and faces to evolve fluidly.
      <br/><br/>DNGA inspired a couple other NEAT-based genetic art programs, including Holger Ferstl's SharpNEAT-based Genetic Art and William Monti's JCPPN. These programs also featured the unique capability to evolve towards recognizable objects.
      <br/><br/>One consequence of these compelling results was Ken Stanley's theory of Compositional Pattern Producing Networks, which in part explains how networks evolved by NEAT are good at representing patterns with familiar regularities, an idea that is capitalized on by Picbreeder as well.
      <div class="header">What makes Picbreeder different?</div>
      A perhaps vexing aspect of NEAT-based genetic art programs is that there was no way to share the genomes (i.e. the DNA) of evolved images with other people. Such sharing would be nice because if, for example, you evolved a nice looking spaceship, your friend may want to further evolve it, if only she had access to its genome.
      <br/><br/>Picbreeder addresses this problem in a most ambitious way: It puts an interactive evolutionary interface in the hands of the public in such a way that every lineage that has ever been produced by anyone can be explored and continued by anyone else. Thus, Picbreeder users are in effect participating in a massive online collaboration to explore the space of possible images.
      <br/><br/>Because Picbreeder images are evolved by NEAT, lineages never end. Any user can pick up where another left off. Furthermore, pictures evolved in Picbreeder have infinite resolution (because they are stored as mathematical objects), which means they are publication quality.
      <br/><br/>Perhaps most intriguing is that we do not know what is possible to evolve. As lineages are built upon lineages, complexification in NEAT means that images can theoretically become more and more complex. Thus, in theory, anything is possible. In this sense Picbreeder's users are pioneers, exploring collectively a space that has never been exhaustively explored, discovering together places that no one of us could have discovered alone.
      <div class="header">Whoa! The website looks different! What happened?</div>
      Due to outdated code, the original Picbreeder website was no longer functional in modern browsers. In 2020 a new team of programmers took on the task of updating the site on both the frontend and backend. The team was made up of Southwestern University students Cameron Henkel, Nicholai Benko, Jaden Williams, Sarah Friday, Anna Krolikowski, and Bennet Leff. Miss the old website? No worries!
      You can find it <a href="http://picbreeder.org/">here</a>.
    </div>
    <Footer/>
  </div>
</template>

<script>
import NavBar from '../components/NavBar.vue'
import Footer from '../components/Footer.vue'

export default {
  name: 'About',
  components: {
    NavBar,
    Footer,
  }
}
</script>

<style>
#aboutText {
  font-size: 14px;
  margin: 10vh 25vw;
  text-align: justify;
}

#aboutTitle {
  text-align: center;
}

#aboutTitle img {
  width: 350px;
}

.header {
  font-size: 22px;
  font-weight: bold;
  margin: 30px 0 10px 0;
}
</style>