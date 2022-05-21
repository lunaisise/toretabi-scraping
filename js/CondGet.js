import common from "./common.js";

class CondGet {
    #lineName = null;

    #dom = null;

    #hasOption = false;
    #hasHidden = false;

    #RL = null;
    #options = [];

    #PGs = [];

    constructor(lineName) {
        this.#lineName = lineName;
    }

    /**
     * 
     * @returns CondGet
     */
    async init() {
        const response = await fetch(`./api/cond?RL=${this.#lineName}`);
        const text = await response.text();
        this.#dom = common.textToNode(text);

        this.#hasOption = this.#dom.querySelector('select[name="RL"]') !== null;
        this.#hasHidden = this.#dom.querySelector('input[type="hidden"][name="RL"]') !== null;

        // console.log(this.#dom);
        if (this.#hasOption) {
            this.#dom.querySelectorAll('select[name="RL"] > option').forEach(option => {
                this.#options.push({
                    rl: option.value,
                    name: option.textContent
                });
            });
        } else if (this.#hasHidden) {
            this.#RL = this.#dom.querySelector('input[type="hidden"][name="RL"]').value;
            this.#dom.querySelectorAll('select[name="PG"] > option').forEach(option => {
                this.#PGs.push({
                    rl: option.value,
                    name: option.textContent
                });
            });
        }

        return this;
    }

    get lineName() {
        return this.#lineName;
    }

    get dom() {
        return this.#dom;
    }

    get hasOption() {
        return this.#hasOption;
    }

    get hasHidden() {
        return this.#hasHidden;
    }

    get options() {
        return this.#options;
    }

    get RL() {
        return this.#RL;
    }

    get PGs() {
        return this.#PGs;
    }
}
export default CondGet;