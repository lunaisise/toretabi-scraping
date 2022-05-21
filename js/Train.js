import common from "./common.js";

class Train {
    #TR = null;

    #trainType;
    #trainNumber;

    constructor(TR) {
        this.#TR = TR;
    }

    async init() {
        const response = await fetch(`./api/train?TR=${this.#TR}`);
        const text = await response.text();
        // console.log(text);
        const dom = common.textToNode(text);
        console.log(dom);

        this.#trainType = dom.querySelector('#text_area dt').textContent;
        this.#trainNumber = dom.querySelector('#text_area dd:nth-of-type(2)').textContent.match(/\[\S+\]/);
        dom.querySelectorAll('tr[align="center"]').forEach(tr => {
            const station = tr.querySelector('td').textContent;
            const arrivalTime = tr.querySelector('td:nth-child(2)').textContent;
            const departureTime = tr.querySelector('td:nth-child(3)').textContent;
            const platform = tr.querySelector('td:last-child').textContent;
        });
    }

    get TR() {
        return this.#TR;
    }
}
export default Train;