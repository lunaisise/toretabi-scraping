import common from "./common.js";

class TraTtGet {
    #lineId = null;
    #selectId = null;

    #dom = null;
    #TRs = [];
    #stations = [];

    constructor(lineId, selectId) {
        this.#lineId = lineId;
        this.#selectId = selectId;

        return this;
    }

    async init(perPage = 999, offset = 0) {
        const response = await fetch(`./api/tra-tt?RL=${this.#lineId}&PG=${this.#selectId}&per_page=${perPage}&offset=${offset}`);
        const text = await response.text();
        // console.log(text);
        this.#dom = common.textToNode(text);

        return this;
    }

    getTrainNumbers() {
        const trs = [];
        this.#dom.querySelectorAll('[href^="/cgi-bin/trinf.cgi/route/trinf?TR="]').forEach(a => {
            trs.push(a.getAttribute('href').match(/\d+$/)[0]);
        });
        this.#TRs = [...new Set(trs)];

        return this;
    }

    getStations() {
        this.#dom.querySelectorAll('[name="EX"] > option').forEach(option => {
            this.#stations.push({
                id: Number(option.value),
                name: option.textContent
            });
        });

        return this;
    }

    get TRs() {
        return this.#TRs;
    }

    get stations() {
        return this.#stations;
    }
}
export default TraTtGet;