import Debug from "debug";
const log = Debug("vectordb");

import HNSW from "hnswlib-node"
const HierarchicalNSW = HNSW.HierarchicalNSW;

import Embeddings from "@themaximalist/embeddings.js"

export default class VectorDB {
    constructor(options = {}) {
        if (typeof options !== "object") { throw new Error("options must be an object") }
        if (typeof options.dimensions === "undefined") { options.dimensions = 384; }
        if (typeof options.size === "undefined") { options.size = 100; }
        if (typeof options.embeddings === "undefined") { options.embeddings = {} };

        this.options = options;
        this.db = new HierarchicalNSW("l2", this.options.dimensions);
        this.size = this.options.size;
        this.db.initIndex(this.options.size);
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
        if (!this.embed) {
            const embeddingOptions = Object.assign({}, this.options.embeddings, options);
            this.embed = new Embeddings(embeddingOptions);
        }

        if (this.cache[input]) {
            log(`cache hit for ${input}`);
            return this.cache[input];
        }

        log(`fetching embeddings for ${input}`);
        const embedding = await this.embed.fetch(input);
        this.cache[input] = embedding;

        return embedding;
    }

    async add(input, obj = undefined) {
        if (this.inputs.includes(input)) {
            log(`input ${input} already exists, replacing object`);
            const index = this.inputs.indexOf(input);
            this.objects[index] = obj;
            return;
        }

        log(`adding ${input}`);
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

        log(`searching for ${input} with ${threshold} threshold and ${num} results`);
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