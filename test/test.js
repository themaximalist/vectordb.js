import "dotenv-extended/config.js"

import assert from "assert"
import VectorDB from "../src/index.js"

describe("VectorDB", function () {

    it("simple compare", async function () {
        this.timeout(10000);

        const db = new VectorDB();
        assert(db);

        await db.add("orange");
        await db.add("blue");
        await db.add("green");

        const results = await db.search("dark orange");
        assert(results.length === 3);
        assert(results[0].input === "orange");
    });

    it("less embeddings (2) than asked for (3)", async function () {
        this.timeout(10000);

        const db = new VectorDB();
        assert(db);

        await db.add("orange");
        await db.add("blue");

        const results = await db.search("dark orange");
        assert(results.length === 2);
        assert(results[0].input === "orange");
    });

    it("auto resize", async function () {
        this.timeout(10000);

        const db = new VectorDB({ size: 1 });
        assert(db);

        await db.add("green");
        await db.add("blue");
        await db.add("orange");

        const results = await db.search("dark orange");
        assert(results.length === 3);
        assert(results[0].input === "orange");
    });

    it("openai embeddings", async function () {
        this.timeout(10000);

        const db = new VectorDB({ dimensions: 1536, size: 10, embeddingOptions: { service: "openai" } });
        assert(db);

        await db.add("orange");
        await db.add("blue");
        await db.add("green");
        await db.add("purple");

        const results = await db.search("dark orange", 4);
        assert(results.length === 4);
        assert(results[0].input === "orange");
    });

    it("add reference objects", async function () {
        this.timeout(10000);

        const db = new VectorDB();
        assert(db);

        await db.add("orange", "oranges");
        await db.add("blue", ["sky", "water"]);
        await db.add("green", { "grass": "lawn" });
        await db.add("purple", { "flowers": 214 });

        const orange = (await db.search("dark orange", 1))[0];
        assert(orange.input === "orange");
        assert(orange.object === "oranges");

        const blue = (await db.search("dark blue", 1))[0];
        assert(blue.input === "blue");
        assert(blue.object[0] === "sky");
        assert(blue.object[1] === "water");

        const green = (await db.search("dark green", 1))[0];
        assert(green.input === "green");
        assert(green.object.grass === "lawn");

        const purple = (await db.search("dark purple", 1))[0];
        assert(purple.input === "purple");
        assert(purple.object.flowers === 214);
    });

    it("skips duplicates", async function () {
        this.timeout(10000);

        const db = new VectorDB();
        assert(db);

        await db.add("orange");
        await db.add("orange");
        await db.add("blue");

        const results = await db.search("dark orange");
        assert(results.length === 2);
        assert(results[0].input === "orange");
    });

    it("skips duplicates updates object", async function () {
        this.timeout(10000);

        const db = new VectorDB();
        assert(db);

        await db.add("orange", "fruit");
        await db.add("orange", "sky");
        await db.add("blue");

        const results = await db.search("dark orange");
        assert(results.length === 2);
        assert(results[0].input === "orange");
        assert(results[0].object === "sky");
    });

    it("modeldeployer embeddings", async function () {
        this.timeout(10000);

        const db = new VectorDB({
            dimensions: 1536,
            size: 10,
            embeddingOptions: {
                service: "modeldeployer",
                model: "7cd96f49-9653-4d03-b47d-65bcee807e71",
                apikey: process.env.OPENAI_API_KEY
            }
        });
        assert(db);

        await db.add("orange");
        await db.add("blue");
        await db.add("green");
        await db.add("purple");

        const results = await db.search("dark orange", 4);
        assert(results.length === 4);
        assert(results[0].input === "orange");
    });
});