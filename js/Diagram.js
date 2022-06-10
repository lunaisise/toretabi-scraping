import {Station} from './Station.js';
import {Train} from './Train.js';
import {OuDia} from './OuDia.js';

class Diagram {
    #routeName;
    #stations = [];
    #trains = {
        down: [],
        up: []
    };

    /**
     * コンストラクター
     * @param {String} routeName 路線名
     * @param {Array} stations 駅一覧
     * @param {Object} trains 列車一覧
     * @returns {Diagram} Diagram
     */
    constructor(routeName, stations, trains) {
        this.#routeName = routeName;
        this.#setStations(stations);
        this.#setTrains(trains);

        // console.log(this);
        return this;
    }

    /**
     * 駅情報をセット
     * @param {Array} stations 駅一覧
     */
    #setStations(stations) {
        stations.forEach(station => {
            this.#stations.push(new Station(station.id, station.name));
        });
        // console.log(this.#stations);
    }

    /**
     * 列車情報をセット
     * @param {Object} trains 列車一覧
     */
    #setTrains(trains) {
        Object.keys(trains).forEach(direction => {
            Object.keys(trains[direction]).forEach(timetableNumber => {
                trains[direction][timetableNumber].trains.forEach(train => {
                    const stations = direction === 'down' ? this.#stations : [...(this.#stations)].reverse();
                    // console.log(stations);
                    this.#trains[direction].push(new Train(stations, trains[direction][timetableNumber].stations, train));
                });
            });
        });
    }

    toOuDia() {
        OuDia(this);
    }

    get routeName() {
        return this.#routeName;
    }

    get stations() {
        return this.#stations;
    }

    get trains() {
        return this.#trains;
    }
}

export {Diagram};