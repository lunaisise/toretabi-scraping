class Train {
    #id;
    #number;
    #operateDay;
    #stations = [];
    #from;
    #to;

    /**
     * コンストラクター
     * @param {Array} stations 全駅
     * @param {Array} timetableStations 時刻表内駅
     * @param {Object} train 列車
     * @returns {Object} this
     */
    constructor(stations, timetableStations, train) {
        // console.log({stations, timetableStations, train});
        this.#id = train.id;
        this.#number = train.number;
        this.#operateDay = train.operate_day;
        this.#from = train.from;
        this.#to = train.to;

        const stationIds = train.stations.map(s => s.id);
        const firstStationId = stationIds[0];
        const lastStationId = stationIds.at(-1);
        // console.log({firstStationId, lastStationId});
        let isStarted = false;
        let isEnded = false;
        stations.forEach(station => {
            // console.log(station.id);
            if (firstStationId === station.id) {
                isStarted = true;
            }
            const isInTimeline = timetableStations.find(s => s.id === station.id) !== undefined;
            const targetStation = train.stations.find(s => s.id === station.id);
            this.#stations.push(new Station(station.id, station.name, isStarted, isEnded, isInTimeline, targetStation?.arrival_time, targetStation?.departure_time, targetStation?.platform));
            if (lastStationId === station.id) {
                isEnded = true;
            }
        });

        // console.log(this);
        return this;
    }
}

class Station {
    #id;
    #name;
    /**
     * -2: 経由なし
     * -1: 始発前または終着後
     * 0: 通過
     * 1: 停車
     */
    #operationType;
    #arrivalTime = null;
    #departureTime = null;
    #platform = null;

    constructor(id, name, isStarted, isEnded, isInTimeline, arrivalTime, departureTime, platform) {
        arrivalTime ??= null;
        departureTime ??= null;
        platform ??= null;
        console.log(id, name, isStarted, isEnded, isInTimeline, arrivalTime, departureTime, platform);
        this.#id = id;
        this.#name = name;

        if (!isStarted || isEnded) {
            this.#operationType = -1;
            console.log('nya- -1');
            return this;
        }
        if (!isInTimeline) {
            this.#operationType = -2;
            console.log('nya- -2');
            return this;
        }
        if (arrivalTime === null && departureTime === null) {
            this.#operationType = 0;
            console.log('nya- 0');
            return this;
        }
        console.log('nya- 1');

        this.#arrivalTime = arrivalTime;
        this.#departureTime = departureTime;
        this.#platform = platform;
    }
}

export {Train};