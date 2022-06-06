import {Diagram} from './Diagram.js';

window.addEventListener('DOMContentLoaded', () => {
    const diagram = (() => {
        const sessionStorageTrains = sessionStorage.getItem('trains');
        const sessionStorageStations = sessionStorage.getItem('stations');
        if ([sessionStorageTrains, sessionStorageStations].includes(null)) {
            return null;
        }
        const routeName = sessionStorage.getItem('routeName');
        const routeId = sessionStorage.getItem('routeId');
        const trains = JSON.parse(sessionStorageTrains);
        const stations = JSON.parse(sessionStorageStations);
        const diagram = new Diagram(routeName, stations, trains);
        return diagram;
    })();

    function setStations() {
        document.querySelectorAll('tbody').forEach(tbody => {
            tbody.textContent = '';
        });
        const template = document.getElementById('station-template');

        // console.log(diagram.stations);
        const directions = {
            down: diagram.stations,
            up: [...diagram.stations].reverse()
        };
        Object.keys(directions).forEach(direction => {
            const stations = directions[direction];
            stations.forEach(station => {
                const clone = template.content.cloneNode(true);
                clone.querySelectorAll('tr').forEach(tr => {
                    tr.dataset.id = station.id;
                });
                clone.querySelector('[rowspan="2"]').textContent = station.name;
                document.querySelector(`#${direction}-table > tbody`).appendChild(clone);
            });
        });
    }

    function setTrains() {
        // console.log(trains);
        document.querySelectorAll('thead > tr:last-child > th:nth-child(n + 2)').forEach(th => {
            th.remove();
        });
        document.querySelectorAll('tbody').forEach(tbody => {
            tbody.textContent = '';
        });

        setStations();

        // console.log(diagram.trains);
        Object.keys(diagram.trains).forEach(direction => {
            // console.log(diagram.trains[direction].length);
            document.querySelector(`#${direction}-table > thead > tr:first-child > th:last-child`).setAttribute('colspan', diagram.trains[direction].length);
            diagram.trains[direction].forEach(train => {
                // console.log(train);
                const th = document.createElement('th');
                th.textContent = train.number;
                document.querySelector('thead > tr:last-child').appendChild(th);

                // console.log(train.stations);
                train.stations.forEach(station => {
                    const trArr = document.querySelector(`#${direction}-table > tbody > tr[data-id="${station.id}"][data-des="arr"]`);
                    const trDep = document.querySelector(`#${direction}-table > tbody > tr[data-id="${station.id}"][data-des="dep"]`);

                    const tdArr = document.createElement('td');
                    tdArr.dataset.id = train.id;
                    const tdDep = document.createElement('td');
                    tdDep.dataset.id = train.id;

                    if (station.operationType === -2) {
                        tdArr.setAttribute('rowspan', 2);
                        trArr.appendChild(tdArr);
                        return;
                    }

                    if (station.operationType === -1) {
                        trArr.appendChild(tdArr);
                        trDep.appendChild(tdDep);
                        return;
                    }

                    if (station.operationType === 0) {
                        tdArr.setAttribute('rowspan', 2);
                        tdArr.textContent = 'レ';
                        trArr.appendChild(tdArr);
                        return;
                    }

                    tdArr.textContent = station.getArrivalTime();
                    trArr.appendChild(tdArr);
                    tdDep.textContent = station.getDepartureTime();
                    trDep.appendChild(tdDep);
                });
            });
        });
    }

    (() => {
        if (diagram === null) {
            alert('時刻表を選択してください。');
            location.href = './';
        }
        // setStations();
        setTrains();
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