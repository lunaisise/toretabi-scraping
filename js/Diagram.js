import {Station} from './Station.js';
import {Train} from './Train.js';

class Diagram {
    #routeName;
    #stations = [];
    #trains = {
        down: [],
        up: []
    };

    constructor(routeName, stations, trains) {
        this.#routeName = routeName;
        this.#setStations(stations);
        this.#setTrains(trains);

        // console.log(this);
        return this;
    }

    #setStations(stations) {
        stations.forEach(station => {
            this.#stations.push(new Station(station.id, station.name));
        });
        // console.log(this.#stations);
    }

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