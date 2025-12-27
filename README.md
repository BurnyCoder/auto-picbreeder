# Picbreeder

An interactive evolutionary art platform that uses neural networks (NEAT/CPPNs) to evolve images without any training data.

<img width="440" height="979" alt="image" src="https://github.com/user-attachments/assets/9f6d1a0b-69ee-4809-8d7a-d9d73f39665f" />

## About

Picbreeder is based on an idea from Jimmy Secretan, originally proposed in a meeting of the [Evolutionary Complexity Research Group (EPlex)](https://en.wikipedia.org/wiki/Kenneth_Stanley) at the University of Central Florida in [Spring 2006](https://x.com/jsecretan/status/1865945596579975478). It allows users to evolve images using [Compositional Pattern Producing Networks (CPPNs)](https://en.wikipedia.org/wiki/Compositional_pattern-producing_network) evolved by [NEAT (NeuroEvolution of Augmenting Topologies)](https://en.wikipedia.org/wiki/Neuroevolution_of_augmenting_topologies).

Key features:
- **Interactive Evolution**: Select images you like to guide the evolution process
- **AI-Assisted Selection**: Optional LLM integration to automatically select the most visually interesting mutations
- **Collaborative**: Build upon images evolved by other users
- **Infinite Resolution**: Images are stored as mathematical objects, making them publication quality
- **Complexification**: Through NEAT, images can become more complex over generations

This project is a fork of [nbenko1.github.io](http://nbenko1.github.io/) with added features including LLM-automated mutation selection, evolution history tracking, and automatic image/genome saving.

## Features

- **Homepage**: Landing page with featured evolved images
- **Evolve**: Interactive evolution interface to create new images
- **Explore**: Browse and discover images evolved by the community
- **Image View**: Detailed view of individual evolved images with ratings and tags
- **History**: Auto-saved evolution history with session tracking, export/import to file, and the ability to reload previous genomes
- **Auto-save Images**: Automatically saves mutated images as PNG + JSON (genome) files to disk via local server
- **AI Auto-Select**: Use OpenAI's GPT-5-Nano to automatically select the most aesthetically interesting image after each mutation

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
npm run dev
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

## Todo
- when evolving, also show currently evolved image
- memory for LLMs in sessions using openai assistants api
- give llm permission to stop evolving
- save those autoselected by AI with a flag
- menu where you race against ai and random selection
- compare LLMs, humans, random selection images
- write paper
