<template>
    <!-- NavBar starts here -->
    <div>
      <b-navbar toggleable="lg" type="light" variant="light">
        <b-navbar-brand href="#" to="/">
            <img alt="Picbreeder logo" src="../assets/picbreeder-logo.svg" style="width:150px;">
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <!-- Everything that collapses into the sandwhich bar goes in here -->
        <b-collapse id="nav-collapse" is-nav>
          <b-nav-form>
            <b-form-input size="lg" class="mr-sm-2" placeholder="Search"></b-form-input>
            <b-button size="lg" class="my-2 my-sm-0" type="submit">Search</b-button>
          </b-nav-form>

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            
            <b-navbar-nav>
              <b-nav-item to="/">Home</b-nav-item>
              <b-nav-item to="/evolve">Evolve</b-nav-item>
              <b-nav-item to="/explore">Explore</b-nav-item>
              <b-nav-item to="/about">About</b-nav-item>
            </b-navbar-nav>

            <b-nav-item-dropdown right>
              <!-- Using 'button-content' slot -->
              <template v-slot:button-content>
                <em>User</em>
              </template>
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item href="#">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>
</template>

<script>
    export default {
    name: 'NavBar'
    }
</script>