class Station {
    #id;
    #name;

    /**
     * コンストラクター
     * @param {Number} id 駅ID
     * @param {String} name 駅名
     * @returns {Object} this
     */
    constructor(id, name) {
        this.#id = id
        this.#name = name;

        return this;
    }

    /**
     * 駅ID
     * @returns {Number} 駅ID
     */
    get id() {
        return this.#id;
    }

    /**
     * 駅名
     * @returns {String} 駅名
     */
    get name() {
        return this.#name;
    }
}

export {Station};