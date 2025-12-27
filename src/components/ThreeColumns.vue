<template>
    <!-- NavBar starts here -->
    <div id='columns'>
        <div class='column'>
            <div class='imageContainer'><img alt="Column One Image" src="../assets/what-is-picbreeder-illustration.svg"></div>
            <div class='columnHeader'>What is Picbreeder?</div>
            Picbreeder is a collaborative art application based on an idea called evolutionary art, which is a technique that allows pictures to be bred almost like animals.
        </div>
        <div class='column'>
            <div class='imageContainer'><img alt="Column One Image" src="../assets/how-does-it-work-illustration.svg"></div>
            <div class='columnHeader'>How does Picbreeder work?</div>
            Picbreeder generates a population of images that a user can choose. The selected images are then used to evolve a new generation via Compositional Pattern Producing Networks (CPPNs). CPPNs are neural networks that contain activation functions which allow them to create and evolve images.
        </div>
        <div class='column'>
            <div class='imageContainer'><img alt="Column One Image" src="../assets/who-created-it-illustration.svg"></div>
            <div class='columnHeader'>Who created it?</div>
            The original idea for Picbreeder came from Jimmy Secretan, who worked with Nick Beato, David D'Ambrosio, Adam Campbell, Adelein Rodriguez, and Dr. Kenneth Stanley to implement it. In 2020, the Picbreeder website was revitalized by Cameron Henkel, Nicholai Benko, Jaden Williams, Sarah Friday, Anna Krolikowski, and Bennet Leff.
        </div>
    </div>
</template>

<script>
    export default {
    name: 'ThreeColumns'
    }
</script>

<!-- Component-specific CSS -->
<style>
#columns {
    display: flex;
    align-items: flex-start;
    width: 90vw;
    margin: 25px 5vw 25px 5vw;
}
.column {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 20px 40px;
    width: 30vw;
    font-size: 12px;
    color: black;
    text-align: justify;
}

.column img {
    width: 15vw;
}

.imageContainer {
    display: flex;
    justify-content: center;
}

.columnHeader {
    font-weight: bold;
    font-size: 16px;
    text-align: center;
}

</style>