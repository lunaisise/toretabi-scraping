import CondGet from "./CondGet.js";
import Train from "./Train.js";
import TraTtGet from "./TraTtGet.js";

window.addEventListener('DOMContentLoaded', () => {
    const hiddenClass = 'hidden';

    const cond2Elem = document.querySelector('#cond2');
    const cond3Elem = document.querySelector('#cond3');
    const RLsElem = document.querySelector('#RLs');
    const PGsElem = document.querySelector('#PGs');

    function cursorWait() {
        document.body.style.cursor = 'wait';
    }

    function cursorDefault() {
        document.body.style.cursor = 'default';
    }

    /**
     * 
     * @param {Number} second 
     */
    function sleep(second) {
        return new Promise(resolve => setTimeout(resolve, second * 1000));
    }

    function setCond2(options) {
        RLsElem.textContent = '';
        cond2Elem.classList.remove(hiddenClass);

        options.forEach(option => {
            // console.log(option);
            const liElem = document.createElement('li');
            const checkboxElem = document.createElement('input');
            checkboxElem.setAttribute('type', 'checkbox');
            checkboxElem.id = `RL-${option.rl}`;
            checkboxElem.value = option.rl;
            liElem.appendChild(checkboxElem);
            const labelElem = document.createElement('label');
            labelElem.setAttribute(`for`, `RL-${option.rl}`);
            labelElem.textContent = option.name;
            liElem.appendChild(labelElem);
            RLsElem.appendChild(liElem);
        });
    }

    /**
     * 
     * @param {Object} PGs 
     * @param {String} name 
     * @param {String} rl
     */
    function setCond3(PGs, name, rl) {
        const h3Elem = document.createElement('h3');
        h3Elem.textContent = name;
        PGsElem.appendChild(h3Elem);
        const ulElem = document.createElement('ul');

        PGs.forEach(pg => {
            // console.log(pg);
            const liElem = document.createElement('li');
            const checkboxElem = document.createElement('input');
            checkboxElem.setAttribute('type', 'checkbox');
            checkboxElem.id = `PG-${pg.rl}`;
            checkboxElem.dataset.rl = rl;
            checkboxElem.dataset.pg = pg.rl;
            liElem.appendChild(checkboxElem);
            const labelElem = document.createElement('label');
            labelElem.setAttribute('for', `PG-${pg.rl}`);
            labelElem.textContent = pg.name;
            liElem.appendChild(labelElem);
            ulElem.appendChild(liElem);
        });
        PGsElem.appendChild(ulElem);
    }

    /**
     * 
     * @param {Array} baseStations 
     * @param {Array} newStations 
     * @returns 
     */
    function setStationList(baseStations, newStations) {
        console.log(baseStations, newStations);
        if (baseStations.length === 0) {
            return newStations;
        }
        const baseStationContain = baseStations.filter(baseStation => {
            for (let newStation of newStations) {
                if (baseStation['id'] === newStation['id']) {
                    return true;
                }
            }
            return false;
        });
        console.log(baseStationContain);
    }

    document.querySelector('#cond').addEventListener('submit', async e => {
        e.preventDefault();

        cond2Elem.classList.add(hiddenClass);
        cond3Elem.classList.add(hiddenClass);

        const RL = document.querySelector('#RL').value;
        const condGet = new CondGet(RL);
        await condGet.init();
        if (condGet.hasOption) {
            // console.log(condGet);
            setCond2(condGet.options);
            return;
        }
        if (condGet.hasHidden) {
            // console.log(condGet);
            PGsElem.textContent = '';
            cond3Elem.classList.remove(hiddenClass);
            setCond3(condGet.PGs, condGet.lineName, condGet.RL);
            return;
        }
        alert('路線が見つかりませんでした。\n別の文言で検索してください。');
    });

    cond2Elem.addEventListener('submit', async e => {
        e.preventDefault();

        PGsElem.textContent = '';
        cond3Elem.classList.remove(hiddenClass);

        const rls = [];
        RLsElem.querySelectorAll('[type="checkbox"]:checked').forEach(checkbox => {
            rls.push(checkbox);
        });
        // console.log(rls);

        cursorWait();

        for (const checkbox of rls) {
            const RL = checkbox.value;

            const condGet = new CondGet(RL);
            await condGet.init();
            // console.log(condGet);
            setCond3(condGet.PGs, document.querySelector(`[for="${checkbox.id}"]`).textContent, RL);
            await sleep(1);
        }

        cursorDefault();
    });

    cond3Elem.addEventListener('submit', async e => {
        e.preventDefault();

        const pgs = [];
        PGsElem.querySelectorAll('[type="checkbox"]:checked').forEach(checkbox => {
            pgs.push(checkbox);
        });

        cursorWait();

        const trainNumbersTmp = [];
        let stations = [];
        for (const checkbox of pgs) {
            const RL = checkbox.dataset.rl;
            const PG = checkbox.dataset.pg;
            const traTtGet = new TraTtGet(RL, PG);
            await traTtGet.init();
            trainNumbersTmp.push(...traTtGet.getTrainNumbers().TRs);
            // console.log(trainNumbers);

            stations = setStationList(stations, traTtGet.getStations().stations);

            await sleep(1);
        }
        const trainNumbers = [...new Set(trainNumbersTmp)];
        // console.log(trainNumbers);

        for (const TR of trainNumbers) {
            // const train = new Train(TR);
            // await train.init();
            await sleep(1);
            break;
        }

        cursorDefault();
    });
});