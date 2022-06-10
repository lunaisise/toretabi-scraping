class Train {
    #id;
    #number;
    #type;
    #operateDay;
    #stations = [];
    #from;
    #to;

    /**
     * コンストラクター
     * @param {Array} stations 全駅
     * @param {Array} timetableStations 時刻表内駅
     * @param {Object} train 列車
     * @returns {Object} Train
     */
    constructor(stations, timetableStations, train) {
        // console.log({stations, timetableStations, train});
        this.#id = train.id;
        this.#number = train.number;
        this.#type = train.type;
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

    get id() {
        return this.#id;
    }

    get number() {
        return this.#number;
    }

    get type() {
        return this.#type;
    }

    get stations() {
        return this.#stations;
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

    /**
     * コンストラクター
     * @param {Number} id 駅ID
     * @param {String} name 駅名
     * @param {Boolean} isStarted 出発済みか
     * @param {Boolean} isEnded 到着済みか
     * @param {Boolean} isInTimeline 時刻表内か
     * @param {String} arrivalTime 到着時刻
     * @param {String} departureTime 出発時刻
     * @param {String} platform プラットホーム
     * @returns {Object} Station
     */
    constructor(id, name, isStarted, isEnded, isInTimeline, arrivalTime, departureTime, platform) {
        arrivalTime ??= null;
        departureTime ??= null;
        platform ??= null;
        // console.log(id, name, isStarted, isEnded, isInTimeline, arrivalTime, departureTime, platform);
        this.#id = id;
        this.#name = name;

        if (!isStarted || isEnded) {
            this.#operationType = -1;
            // console.log('nya- -1');
            return this;
        }
        if (!isInTimeline) {
            this.#operationType = -2;
            // console.log('nya- -2');
            return this;
        }
        if (arrivalTime === null && departureTime === null) {
            this.#operationType = 0;
            // console.log('nya- 0');
            return this;
        }
        // console.log('nya- 1');

        this.#arrivalTime = arrivalTime;
        this.#departureTime = departureTime;
        this.#platform = platform;
    }

    /**
     * 時と分を「:」で区切った時刻
     * @param {String} time 時刻
     * @returns {String} h:i
     */
    #toTime(time) {
        return time?.padStart(4, '0').match(/.{2}/g).join(':');
    }

    /**
     * 到着時刻
     * @returns {String} h:i
     */
    getArrivalTime() {
        return this.#toTime(this.#arrivalTime);
    }

    /**
     * 出発時刻
     * @returns {String} h:i
     */
    getDepartureTime() {
        return this.#toTime(this.#departureTime);
    }

    get id() {
        return this.#id;
    }

    get operationType() {
        return this.#operationType;
    }
}

export {Train};