# Auto Picbreeder

Auto Picbreeder is Picbreeder but LLMs can play the role of humans. Picbreeder evolves images without any training data using [Compositional Pattern Producing Networks (CPPNs)](https://en.wikipedia.org/wiki/Compositional_pattern-producing_network) evolved by [NEAT (NeuroEvolution of Augmenting Topologies)](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies).

**CPPNs** are neural networks that take pixel coordinates as input and output colors, using diverse activation functions (sin, cos, gaussian, etc.) to create complex patterns at infinite resolution. **NEAT** is a genetic algorithm that evolves both the topology and weights of these networks, starting simple and growing more complex over generations.

<img width="440" height="979" alt="image" src="https://github.com/user-attachments/assets/9f6d1a0b-69ee-4809-8d7a-d9d73f39665f" />

This project is a fork of [nbenko1.github.io](http://nbenko1.github.io/) with added features including LLM-automated mutation selection, evolution history tracking, and automatic image/genome saving.

## Features

- **Interactive Evolution**: Select images you like to guide the evolution process through an intuitive interface
- **AI-Assisted Selection**: Optional LLM integration to automatically select the most visually interesting mutations
- **Complexification**: Through NEAT, images can become more complex over generations
- **Infinite Resolution**: Images are stored as mathematical objects, making them publication quality
- **Collaborative**: Build upon images evolved by other users
- **Explore**: Browse and discover images evolved by the community
- **Image View**: Detailed view of individual evolved images with ratings and tags
- **History**: Auto-saved evolution history with session tracking, export/import to file, and the ability to reload previous genomes
- **Auto-save**: Automatically saves mutated images as PNG + JSON (genome) files to disk via local server

## Tech Stack

- Vue.js 2.x
- Vue Router
- Bootstrap / Bootstrap-Vue
- Hooper (carousel component)
- NEAT.js (neural network evolution)
- Express (dev server for image auto-save)
- OpenAI API (optional, for AI-assisted selection)

## Development

### Prerequisites

- Node.js (v12 or higher recommended)
- npm

### Setup

```bash
npm install
```

### Configure AI Selection (Optional)

To enable AI-assisted image selection using LLMs, add your OpenAI API key to `.env`:

```bash
VUE_APP_OPENAI_API_KEY=sk-your-api-key-here
```

Alternatively, you can enter the API key directly in the UI via the settings button on the Evolve page.

### Run Development Server

```bash
npm run serve
```

This runs both the Vue app (http://localhost:8080/) and the image save server (port 3001). Each mutation automatically saves PNG images and genome JSON files to `images/<session-id>/` subfolders.

Or run them separately:
```bash
npm run server   # Image save server only (port 3001)
npm run serve    # Vue dev server only (port 8080)
```

### Production Build

```bash
npm run build
```

## Project Structure

```
├── public/
│   └── index.html
├── images/                # Auto-saved PNG + JSON files (session subfolders)
├── server.js              # Express server for auto-saving images
├── src/
│   ├── assets/              # Images, CSS, SVGs
│   ├── components/          # Vue components
│   │   ├── EvolveGrid.vue
│   │   ├── EvolveOptions.vue
│   │   ├── ExploreCarousel.vue
│   │   ├── ExploreCategoryOption.vue
│   │   ├── ExploreFilter.vue
│   │   ├── Footer.vue
│   │   ├── NavBar.vue
│   │   └── ThreeColumns.vue
│   ├── lib/                 # Core libraries
│   │   ├── convnet.js       # Convolutional network
│   │   ├── jquery-1.11.3.min.js
│   │   ├── neat.js          # NEAT algorithm
│   │   ├── netart.js        # Network art generation
│   │   └── recurrent.js     # Recurrent network
│   ├── router/              # Vue Router config
│   │   └── index.js
│   ├── services/            # Application services
│   │   ├── historyStorage.js  # LocalStorage history management
│   │   └── openaiService.js   # OpenAI API integration for AI selection
│   ├── views/               # Page components
│   │   ├── About.vue
│   │   ├── Evolve.vue
│   │   ├── EvolvedImage.vue
│   │   ├── Explore.vue
│   │   ├── History.vue
│   │   └── Homepage.vue
│   ├── App.vue
│   └── main.js
├── babel.config.js
├── vue.config.js
└── package.json
```

## Credits

Picbreeder is based on an idea from Jimmy Secretan, originally proposed in a meeting of the [Evolutionary Complexity Research Group (EPlex)](https://en.wikipedia.org/wiki/Kenneth_Stanley) at the University of Central Florida in [Spring 2006](https://x.com/jsecretan/status/1865945596579975478).

### [Original Picbreeder Team (2006)](https://dl.acm.org/doi/10.1145/1357054.1357328)
- Jimmy Secretan (original concept)
- Nick Beato
- David D'Ambrosio
- Adam Campbell
- Adelein Rodriguez
- Jeremiah T. Folsom-Kovarik
- [Dr. Kenneth Stanley](https://en.wikipedia.org/wiki/Kenneth_Stanley) (supervisor)

## License

MIT

## Todo
- when evolving, also show currently evolved images to the LLM
- better memory for LLMs in sessions
- give llm permission to stop evolving
- save those autoselected by AI with a flag
- menu where you race against ai and random selection
- compare LLMs, humans, random selection images
- write paper
- rewrite backend in python
- maybe there could be more specialized model that could be used instead of LLMs for automatic mutated image picking