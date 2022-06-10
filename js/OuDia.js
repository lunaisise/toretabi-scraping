class OuDiaClass {
    #lines = ['FileType=OuDia.1.02'];

    /**
     * コンストラクター
     * @param {Diagram} Diagram ダイアグラムクラス
     * @returns OuDiaクラス
     */
    constructor(Diagram) {
        this.#setRosen(Diagram.routeName);
        this.#setStations(Diagram.stations);
        this.#setTrainType([...Diagram.trains.down, ...Diagram.trains.up]);
        return this;
    }

    /**
     * 路線名をセット
     * @param {String} routeName 路線名
     */
    #setRosen(routeName) {
        this.#lines.push('Rosen.');
        this.#lines.push(`Rosenmei=${routeName}`);
    }

    /**
     * 駅情報をセット
     * @param {Array} stations 駅一覧
     */
    #setStations(stations) {
        let isFirstStation = true;
        stations.forEach(station => {
            if (!isFirstStation) {
                this.#lines.push('.');
            }
            this.#lines.push('Eki.');
            this.#lines.push(`Ekimei=${station.name}`);
            this.#lines.push('Ekijikokukeisiki=Jikokukeisiki_Hatsuchaku');
            this.#lines.push('Ekikibo=Ekikibo_Ippan');
            isFirstStation = false;
        });
    }

    /**
     * 列車種別をセット
     * @param {Array} trains 列車種別配列
     */
    #setTrainType(trains) {
        const trainTypes = Array.from(new Set(trains.map(train => train.type)));
        trainTypes.forEach(trainType => {
            this.#lines.push('.');
            this.#lines.push('Ressyasyubetsu.');
            this.#lines.push(`Syubetsumei=${trainType}`);
            this.#lines.push(`Ryakusyou=${trainType}`);
            this.#lines.push('JikokuhyouMojiColor=00000000');
            this.#lines.push('JikokuhyouFontIndex=0');
            this.#lines.push('DiagramSenColor=00000000');
            this.#lines.push('DiagramSenStyle=SenStyle_Jissen');
            this.#lines.push('StopMarkDrawType=EStopMarkDrawType_DrawOnStop');
        });
    }

    #setTrains(trains) {
        
    }
}

/**
 * 
 * @param {Diagram} Diagram ダイアグラムクラス
 * @returns OuDiaクラス
 */
function OuDia(Diagram) {
    const OuDiaClass = new OuDiaClass(Diagram);
    return OuDiaClass;
}

export {OuDia};