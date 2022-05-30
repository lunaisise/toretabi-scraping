import {Diagram} from './Diagram.js';

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
        document.querySelectorAll('tbody').forEach(tbody => {
            tbody.textContent = '';
        });
        const template = document.getElementById('station-template');
        stations.forEach(station => {
            const clone = template.content.cloneNode(true);
            clone.querySelectorAll('tr').forEach(tr => {
                tr.dataset.id = station.id;
            });
            clone.querySelector('[rowspan="2"]').textContent = station.name;
            document.querySelector('#down-table > tbody').appendChild(clone);
        });
        stations.reverse().forEach(station => {
            const clone = template.content.cloneNode(true);
            clone.querySelectorAll('tr').forEach(tr => {
                tr.dataset.id = station.id;
            });
            clone.querySelector('[rowspan="2"]').textContent = station.name;
            document.querySelector('#up-table > tbody').appendChild(clone);
        });
    }

    function setTrains() {
        // console.log(trains);
        document.querySelectorAll('thead > tr:last-child > th:nth-child(n + 2)').forEach(th => {
            th.remove();
        });
        let directionCounts = {
            down: 0,
            up: 0
        };
        Object.keys(trains).forEach(direction => {
            Object.keys(trains[direction]).forEach(timetableNumber => {
                trains[direction][timetableNumber].trains.forEach(train => {
                    const trainId = train.id;
                    const th = document.createElement('th');
                    th.dataset.id = trainId;
                    th.textContent = train.number;
                    document.querySelector(`#${direction}-table > thead > tr:last-child`).appendChild(th);
                    document.querySelectorAll(`#${direction}-table > tbody > tr`).forEach(tr => {
                        const td = document.createElement('td');
                        td.dataset.id = trainId;
                        tr.appendChild(td);
                    });
                    const trainStationIds = [];
                    train.stations.forEach(station => {
                        const stationId = station.id;
                        trainStationIds.push(stationId);
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
                        if (trainStationIds.includes(station.id)) {
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
                        if (trainStationIds.includes(station.id)) {
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
                    directionCounts[direction]++;
                });
            });
        });
        Object.keys(directionCounts).forEach(direction => {
            document.querySelector(`#${direction}-table > thead > tr > th:last-child`).setAttribute('colspan', directionCounts[direction]);
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
        // setStations();
        // setTrains();

        new Diagram(routeName, stations, trains);
    })();

    document.querySelectorAll('[name="direction"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const id = document.querySelector('[name="direction"]:checked').id;
            document.querySelectorAll('main > div > label').forEach(label => {
                label.classList.remove('checked');
            });
            document.querySelector(`[for="${id}"]`).classList.add('checked');
        });
    });
});