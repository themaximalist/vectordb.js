import assert from "assert"
import VectorDB from "../src/index.js"

describe("VectorDB", function () {
    it("simple compare", async function () {
        this.timeout(10000);

        const db = new VectorDB();
        assert(db);

        await db.add("orange");
        await db.add("blue");

        const result = await db.search("dark orange");
        console.log(result);
        assert(result.length === 1);
        assert(result[0].input === "orange");
    });
});

// TODO: add dynamic resizing of vector DB
