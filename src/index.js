import Debug from "debug";
const log = Debug("vectordb");

import HNSW from "hnswlib-node"
const HierarchicalNSW = HNSW.HierarchicalNSW;

import embeddings from "@themaximalist/embeddings.js"

export default class VectorDB {
    constructor(options = {}) {
        if (typeof options !== "object") { throw new Error("options must be an object") }
        if (typeof options.dimensions === "undefined") { options.dimensions = 384; }
        if (typeof options.size === "undefined") { options.size = 100; }
        if (typeof options.embeddingOptions === "undefined") { options.embeddingOptions = {} };

        this.db = new HierarchicalNSW("l2", options.dimensions);
        this.embeddingOptions = options.embeddingOptions;
        this.size = options.size;
        this.db.initIndex(options.size);
        this.embeddingOptions = options.embeddingOptions;
        this.inputs = [];
        this.embeddings = [];
        this.objects = [];
        this.cache = {};
    }

    resize(size) {
        log("resizing to %d", size);
        this.size = size;
        this.db.resizeIndex(this.size);
    }

    async embedding(input, options = {}) {
        if (this.cache[input]) {
            return this.cache[input];
        }

        const embeddingOptions = Object.assign({}, this.embeddingOptions, options);
        const embedding = await embeddings(input, embeddingOptions);
        this.cache[input] = embedding;
        return embedding;
    }

    async add(input, obj = undefined) {
        if (this.inputs.includes(input)) {
            const index = this.inputs.indexOf(input);
            this.objects[index] = obj;
            return;
        }

        const embedding = await this.embedding(input);
        this.inputs.push(input);
        this.embeddings.push(embedding);
        this.objects.push(obj);

        if (this.embeddings.length > this.size) {
            this.resize(this.size * 2);
        }

        this.db.addPoint(embedding, this.embeddings.length - 1);
    }

    async search(input, num = 3, threshold = 1) {
        const embedding = await this.embedding(input);

        if (this.embeddings.length < num) {
            num = this.embeddings.length;
        }

        const { distances, neighbors } = this.db.searchKnn(embedding, num);

        const results = [];

        for (let i = 0; i < distances.length; i++) {
            if (distances[i] <= threshold) {
                const result = {
                    input: this.inputs[neighbors[i]],
                    distance: distances[i]
                };

                const obj = this.objects[neighbors[i]];
                if (obj) {
                    result.object = obj;
                }

                results.push(result);
            }
        }

        return results;
    }
}

