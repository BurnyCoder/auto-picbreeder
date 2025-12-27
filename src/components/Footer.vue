<template>
    <!-- NavBar starts here -->
    <div id='footerColumns'>
        <div class='footerColumn'>
        </div>
        <div class='footerColumn'>
            <img id="eplex" src="../assets/eplex.jpg"/>
            <div>Picbreeder: Collaborative Interactive Art Evolution (Genetic Art)</div>
        </div>
        <div class='footerColumn'>
        </div>
    </div>
</template>

<script>
    export default {
    name: 'Footer'
    }
</script>

<!-- Component-specific CSS -->
<style>
#footerColumns {
    display: flex;
    align-items: flex-start;
    width: 95vw;
    margin: 25px 2.5vw 10px 2.5vw;
}
.footerColumn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 0 20px 0 20px;
    width: 30vw;
    font-size: 10px;
    color: black;
    text-align: center;
}

#eplex {
    align-self: center;
    width: 300px;
}

</style>