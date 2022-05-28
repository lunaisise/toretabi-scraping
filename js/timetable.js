window.addEventListener('DOMContentLoaded', () => {
    const {routeName, routeId, stations, trains} = (() => {
        const routeName = sessionStorage.getItem('routeName');
        const routeId = sessionStorage.getItem('routeId');
        const sessionStorageTrains = sessionStorage.getItem('trains');
        const sessionStorageStations = sessionStorage.getItem('stations');
        if ([sessionStorageTrains, sessionStorageStations].includes(null)) {
            return {
                routeName,
                routeId,
                stations: null,
                trains: null
            };
        }
        const trains = JSON.parse(sessionStorageTrains);
        const stations = JSON.parse(sessionStorageStations);
        return {
            routeName,
            routeId: Number(routeId),
            stations,
            trains
        };
    })();

    function setStations() {
        document.querySelector('tbody').textContent = '';
        stations.forEach(station => {
            const arrTr = document.createElement('tr');
            arrTr.dataset.id = station.id;
            arrTr.dataset.des = 'arr';
            const nameTh = document.createElement('th');
            nameTh.setAttribute('rowspan', 2);
            nameTh.textContent = station.name;
            const arrTh = document.createElement('th');
            arrTh.textContent = '着';
            arrTr.appendChild(nameTh);
            arrTr.appendChild(arrTh);
            document.querySelector('tbody').appendChild(arrTr);
            const depTr = document.createElement('tr');
            depTr.dataset.id = station.id;
            depTr.dataset.des = 'dep';
            const depTh = document.createElement('th');
            depTh.textContent = '発';
            depTr.appendChild(depTh);
            document.querySelector('tbody').appendChild(depTr);
        });
    }

    function setTrains() {
        console.log(trains);
        document.querySelectorAll('thead > tr:last-child > th:nth-child(n + 2)').forEach(th => {
            th.remove();
        });
        let trainCount = 0;
        Object.keys(trains).forEach(timetableNumber => {
            trains[timetableNumber].trains.forEach(train => {
                const id = train.id;
                const th = document.createElement('th');
                th.dataset.id = id;
                th.textContent = train.number;
                document.querySelector('thead > tr:last-child').appendChild(th);
                document.querySelectorAll('tbody > tr').forEach(tr => {
                    const td = document.createElement('td');
                    td.dataset.id = id;
                    tr.appendChild(td);
                });
                trainCount++;
            });
        });
        document.querySelector('thead > tr > th:last-child').setAttribute('colspan', trainCount);
        Object.keys(trains).forEach(timetableNumber => {
            trains[timetableNumber].trains.forEach(train => {
                const trainId = train.id;
                const trainStationId = [];
                train.stations.forEach(station => {
                    const stationId = station.id;
                    trainStationId.push(stationId);
                    const arrTd = document.querySelector(`tr[data-id="${stationId}"][data-des="arr"] > td[data-id="${trainId}"]`) ?? null;
                    if (arrTd !== null && station.arrival_time !== null) {
                        arrTd.textContent = `${station.arrival_time}`.padStart(4, '0').match(/.{2}/g).join(':');
                    }
                    const depTd = document.querySelector(`tr[data-id="${stationId}"][data-des="dep"] > td[data-id="${trainId}"]`) ?? null;
                    if (depTd !== null && station.departure_time !== null) {
                        depTd.textContent = `${station.departure_time}`.padStart(4, '0').match(/.{2}/g).join(':');
                    }
                });
                let isTrainStarted = false;
                stations.forEach(station => {
                    if (trainStationId.includes(station.id)) {
                        isTrainStarted = true;
                    }
                    if (!isTrainStarted) {
                        return;
                    }
                    const td = document.querySelector(`tr[data-id="${station.id}"][data-des="dep"] > td[data-id="${trainId}"]`);
                    if (td.textContent.length === 0) {
                        td.dataset.started = 'true';
                    }
                });
                let isTrainEnded = true;
                stations.reverse().forEach(station => {
                    if (trainStationId.includes(station.id)) {
                        isTrainEnded = false;
                    }
                    if (isTrainEnded) {
                        return;
                    }
                    if (document.querySelector(`tr[data-id="${station.id}"][data-des="arr"] > td[data-id="${trainId}"]`).textContent.length !== 0) {
                        return;
                    }
                    const td = document.querySelector(`tr[data-id="${station.id}"][data-des="dep"] > td[data-id="${trainId}"]`);
                    if (td.textContent.length === 0) {
                        td.dataset.ended = 'false';
                    }
                });
            });
        });
        document.querySelectorAll('tr[data-des="dep"]').forEach(tr => {
            const stationId = tr.dataset.id;
            tr.querySelectorAll('td[data-started="true"][data-ended="false"]').forEach(td => {
                const trainId = td.dataset.id;
                const arr = document.querySelector(`tr[data-id="${stationId}"][data-des="arr"] > td[data-id="${trainId}"]`);
                arr.setAttribute('rowspan', 2);
                arr.textContent = 'レ';
                td.remove();
            });
        });
    }

    (() => {
        console.log({routeName, routeId, stations, trains});
        if ([routeName, routeId, stations, trains].includes(null)) {
            alert('時刻表を選択してください。');
            location.href = './';
        }
        setStations();
        setTrains();
    })();
});