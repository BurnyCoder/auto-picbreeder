# Picbreeder

An interactive evolutionary art platform that uses neural networks (NEAT/CPPNs) to evolve images collaboratively.

## About

Picbreeder is based on an idea from Jimmy Secretan, originally proposed in a meeting of the [Evolutionary Complexity Research Group (EPlex)](https://en.wikipedia.org/wiki/Kenneth_Stanley) at the University of Central Florida in [Spring 2006](https://x.com/jsecretan/status/1865945596579975478). It allows users to evolve images using [Compositional Pattern Producing Networks (CPPNs)](https://en.wikipedia.org/wiki/Compositional_pattern-producing_network) evolved by [NEAT (NeuroEvolution of Augmenting Topologies)](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies).

Key features:
- **Interactive Evolution**: Select images you like to guide the evolution process
- **Collaborative**: Build upon images evolved by other users
- **Infinite Resolution**: Images are stored as mathematical objects, making them publication quality
- **Complexification**: Through NEAT, images can become more complex over generations

## Features

- **Homepage**: Landing page with featured evolved images
- **Evolve**: Interactive evolution interface to create new images
- **Explore**: Browse and discover images evolved by the community
- **Image View**: Detailed view of individual evolved images with ratings and tags

## Tech Stack

- Vue.js 2.x
- Vue Router
- Bootstrap / Bootstrap-Vue
- Hooper (carousel component)
- NEAT.js (neural network evolution)

## Development

### Prerequisites

- Node.js (v12 or higher recommended)
- npm

### Setup

```bash
cd picbreeder-dev
npm install
```

### Run Development Server

```bash
npm run serve
```

The app will be available at http://localhost:8080/ with hot-reload enabled.

### Production Build

```bash
npm run build
```

## Project Structure

```
picbreeder-dev/
├── public/
│   └── index.html
├── src/
│   ├── assets/          # Images, CSS, SVGs
│   ├── components/      # Vue components
│   │   ├── EvolveGrid.vue
│   │   ├── EvolveOptions.vue
│   │   ├── ExploreCarousel.vue
│   │   ├── ExploreFilter.vue
│   │   ├── NavBar.vue
│   │   └── Footer.vue
│   ├── lib/             # Core libraries
│   │   ├── neat.js      # NEAT algorithm
│   │   ├── netart.js    # Network art generation
│   │   ├── convnet.js   # Convolutional network
│   │   └── recurrent.js # Recurrent network
│   ├── router/          # Vue Router config
│   ├── views/           # Page components
│   │   ├── Homepage.vue
│   │   ├── Evolve.vue
│   │   ├── Explore.vue
│   │   ├── EvolvedImage.vue
│   │   └── About.vue
│   ├── App.vue
│   └── main.js
└── package.json
```

## Credits

### [Original Picbreeder Team (2006)](https://dl.acm.org/doi/10.1145/1357054.1357328)
- Jimmy Secretan (original concept)
- Nick Beato
- David D'Ambrosio
- Adam Campbell
- Adelein Rodriguez
- Jeremiah T. Folsom-Kovarik
- [Dr. Kenneth Stanley](https://en.wikipedia.org/wiki/Kenneth_Stanley) (supervisor)

## References

- [NEAT (NeuroEvolution of Augmenting Topologies)](http://nn.cs.utexas.edu/downloads/papers/stanley.ec02.pdf)
- [Compositional Pattern Producing Networks](https://link.springer.com/article/10.1007/s10710-007-9028-8)

## License

MIT
