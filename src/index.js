import HNSW from "hnswlib-node"
const HierarchicalNSW = HNSW.HierarchicalNSW;

import embeddings from "@themaximalist/embeddings.js"

export default class VectorDB {
    constructor(dimensions = 384, default_size = 1000) {
        this.db = new HierarchicalNSW("l2", dimensions);
        this.db.initIndex(default_size);
        this.inputs = [];
        this.embeddings = [];
        this.cache = {};
    }

    async embedding(input) {
        if (this.cache[input]) {
            return this.cache[input];
        }

        const embedding = await embeddings(input);
        this.cache[input] = embedding;
        return embedding;
    }

    async add(input) {
        const embedding = await this.embedding(input);
        this.inputs.push(input);
        this.embeddings.push(embedding);
        this.db.addPoint(embedding, this.embeddings.length - 1);
    }

    async search(input, num = 3, threshold = 0.5) {
        const embedding = await this.embedding(input);

        console.log(this.db);
        const { distances, neighbors } = this.db.searchKnn(embedding, num);

        const results = [];

        for (let i = 0; i < distances.length; i++) {
            if (distances[i] <= threshold) {
                results.push({
                    input: this.inputs[neighbors[i]],
                    distance: distances[i]
                });
            }
        }

        return results;
    }

}

/*


async function main() {
    // Allocate a pipeline for sentiment-analysis
    // text-classification,token-classification,question-answering,fill-mask,summarization,translation,text2text-generation,text-generation,zero-shot-classification,audio-classification,zero-shot-audio-classification,automatic-speech-recognition,text-to-audio,image-to-text,image-classification,image-segmentation,zero-shot-image-classification,object-detection,zero-shot-object-detection,document-question-answering,image-to-image,depth-estimation,feature-extraction

    let pipe = await pipeline('feature-extraction', "Xenova/all-MiniLM-L6-v2", {
        config: {

        }
    });

    const trump = await pipe('Donald Trump');
    const obama = await pipe('Barack Obama');
    const cat = await pipe('Garfield the Cat');
    const clinton = await pipe('Bill Clinton');

    // console.log(trump.tolist()[0].length);
    console.log(trump.size);
    console.log(obama.size);
    console.log(cat.size);
    console.log(clinton.size);
    // console.log(Array.prototype.slice.call(cat.data).length);
    // console.log(Array.prototype.slice.call(clinton.data).length);

    index.addPoint(trump.size(1536), 0);
    // index.addPoint(Array.prototype.slice.call(obama.data), 1);
    // index.addPoint(Array.prototype.slice.call(cat.data), 2);
    // index.addPoint(Array.prototype.slice.call(clinton.data), 3);


    const result = index.searchknn(array.prototype.slice.call(trump.data), 3);
    console.log(result);

    // console.log(cosineSimilarity(trump.data, obama.data));
    // console.log(cosineSimilarity(trump.data, cat.data));
    // console.log(cosineSimilarity(trump.data, clinton.data));
    // console.log(cosineSimilarity(obama.data, clinton.data));
}

main();
*/
