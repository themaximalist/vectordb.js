# vectordb.js

> Simple embeddings and vector search for NodeJS

VectorDB is the simplest way to do text similarity in Node.js

-   Uses [hnswlib-node](https://github.com/yoshoku/hnswlib-node) for simple vector search
-   Uses [embeddings.js](https://github.com/themaximal1st/embeddings.js) for simple text embeddings
-   Supports local embeddings and OpenAI
-   Caches embeddings to `embeddings.cache.json`
-   Automatically resizes database size
-   Store objects with embeddings
-   MIT license



## Usage

```javascript
import VectorDB from "@themaximalist/vectordb.js"
const db = new VectorDB();

await db.add("orange");
await db.add("blue");

const result = await db.search("light orange");
// [ { input: 'orange', distance: 0.3109036684036255 } ]
```



## Installation

```bash
npm install @themaximalist/vectordb.js
```

To use local embeddings, install the transformers library:

```bash
npm install @xenova/transformers
```



## OpenAI embeddings

VectorDB.js works with local or OpenAI embeddings. To use OpenAI (`text-embedding-ada-002`) either pass an `apikey` to the `embeddings` options or set the `OPENAI_API_KEY` environment variable.

```javascript
import VectorDB from "@themaximalist/vectordb.js"

const db = new VectorDB({ dimensions: 1536, size: 100, embeddings: { service: "openai"});

await db.add("orange");
await db.add("blue");
await db.add("green");
await db.add("purple");

// ask for up to 4 embeddings back, default is 3
const results = await db.search("light orange", 4);
assert(results.length === 4);
assert(results[0].input === "orange");
```



## Embeddings with Objects

`vectordb.js` can store any valid JavaScript object along with the embedding.

```javascript
import VectorDB from "@themaximalist/vectordb.js"
const db = new VectorDB();

await db.add("orange", "oranges");
await db.add("blue", ["sky", "water"]);
await db.add("green", { "grass": "lawn" });
await db.add("purple", { "flowers": 214 });

const results = await db.search("light green", 1);
assert(results[0].object.grass == "lawn");
```



## Deploy Embeddings

`vectordb.js` can work by itself, but was built side-by-side to work with [Model Deployer](https://github.com/themaximal1st/modeldeployer).

Model Deployer is an easy way to deploy your LLM and Embedding models in production. You can monitor usage, rate limit users, generate API keys with specific settings and more.

It's especially helpful in offering options to your users. They can download and run models locally, they can use your API, or they can provide their own API key.

It works out of the box with vectordb.js.

```javascript
import VectorDB from "@themaximalist/vectordb.js"
const db = new VectorDB({
  embeddings: {
    service: "modeldeployer",
    model: "model-api-key-goes-here",
  }
});

await db.add("orange", "oranges");
await db.add("blue", ["sky", "water"]);
await db.add("green", { "grass": "lawn" });
await db.add("purple", { "flowers": 214 });

const results = await db.search("light green", 1);
assert(results[0].object.grass == "lawn");
```





## About

https://themaximalist.com

https://twitter.com/themaximal1st



## License

MIT
