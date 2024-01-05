import Debug from "debug";
const log = Debug("vectordb");

import HNSW from "hnswlib-node"
const HierarchicalNSW = HNSW.HierarchicalNSW;

import embeddings from "@themaximalist/embeddings.js"

export default class VectorDB {
    constructor(dimensions = 384, size = 100, embeddings_provider = "local") {
        this.db = new HierarchicalNSW("l2", dimensions);
        this.embeddings_provider = embeddings_provider;
        this.size = size;
        this.db.initIndex(size);
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

    async embedding(input) {
        if (this.cache[input]) {
            return this.cache[input];
        }

        const embedding = await embeddings(input, this.embeddings_provider);
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

