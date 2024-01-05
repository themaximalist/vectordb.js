# vectordb.js

> simple embeddings and vectordb for node.js

-   Uses [hnswlib-node](https://github.com/yoshoku/hnswlib-node) for simple vector search
-   Uses [embeddings.js](https://github.com/themaximal1st/embeddings.js) for simple text embeddings
-   Supports local embeddings and OpenAI
-   Caches embeddings to `embeddings.cache.json`
-   Automatically resizes database size
-   Store objects with embeddings
-   MIT license



## Installation

```bash
npm install @themaximalist/vectordb.js
```



## Usage

```javascript
import VectorDB from "@themaximalist/vectordb.js"
const db = new VectorDB();

await db.add("orange");
await db.add("blue");

const result = await db.search("light orange");
// [ { input: 'orange', distance: 0.3109036684036255 } ]
```



**OpenAI embeddings**

```javascript
import VectorDB from "@themaximalist/vectordb.js"

// 1536 dimensionsize
// 100 default db size (autoresizes)
// "local" (default) or "openai" for embeddings provider
const db = new VectorDB(1536, 100, "openai");

await db.add("orange");
await db.add("blue");
await db.add("green");
await db.add("purple");

// ask for up to 4 embeddings back, default is 3
const results = await db.search("light orange", 4);
assert(results.length === 4);
assert(results[0].input === "orange");
```



**Embeddings with Objects**

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



## Configuration

`vectordb.js` works out of the box, but if you use the OpenAI embeddings you'll need an `OPENAI_API_KEY` in your environment.

```bash
export OPENAI_API_KEY=<your-openai-api-key>
```



## About

https://themaximalist.com

https://twitter.com/themaximal1st



## License

MIT
