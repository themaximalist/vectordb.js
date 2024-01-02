# vectordb.js

Simple vector search

```javascript
import VectorDB from "@themaximalist/vectordb.js"
const db = new VectorDB();

await db.add("orange");
await db.add("blue");

const result = await db.search("dark orange");
// [ { input: 'orange', distance: 0.3109036684036255 } ]
```

