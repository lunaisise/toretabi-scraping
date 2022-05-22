window.addEventListener('DOMContentLoaded', () => {
    const {routeName, routeId, stations, trains} = (() => {
        const routeName = sessionStorage.getItem('routeName');
        const routeId = sessionStorage.getItem('routeId');
        const text = sessionStorage.getItem('trains');
        if (text === null) {
            return {
                routeName,
                routeId,
                stations: null,
                trains: null
            };
        }
        const json = JSON.parse(text);
        return {
            routeName,
            routeId: Number(routeId),
            stations: json.stations,
            trains: json.trains
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
        document.querySelectorAll('thead > tr:last-child > th:nth-child(n + 2)').forEach(th => {
            th.remove();
        });
        document.querySelector('thead > tr > th:last-child').setAttribute('colspan', trains.length);
        trains.forEach(train => {
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
        });
        trains.forEach(train => {
            const trainId = train.id;
            train.stations.forEach(station => {
                const statinoId = station.id;
                const arrTd = document.querySelector(`tr[data-id="${statinoId}"][data-des="arr"] > td[data-id="${trainId}"]`) ?? null;
                if (arrTd !== null && station.arrival_time !== null) {
                    arrTd.textContent = `${station.arrival_time}`.padStart(4, '0').match(/.{2}/g).join(':');
                }
                const depTd = document.querySelector(`tr[data-id="${statinoId}"][data-des="dep"] > td[data-id="${trainId}"]`) ?? null;
                if (depTd !== null && station.departure_time !== null) {
                    depTd.textContent = `${station.departure_time}`.padStart(4, '0').match(/.{2}/g).join(':');
                }
            });
        });
        trains.forEach(train => {
            const trainId = train.id;
            const stops = [];
            const tds = document.querySelectorAll(`tbody > tr > td[data-id="${trainId}"]`);
            for (let i = 0; i < tds.length; i++) {
                if (tds[i].textContent.length !== 0) {
                    stops.push(i);
                }
            }
            for (let i = 1; i < stops.length; i++) {
                const lastStop = stops[i - 1];
                const thisStop = stops[i];
                for (let j = lastStop + 1; j < thisStop; j++) {
                    const td = tds[j];
                    td.dataset.passage = 'true';
                    td.textContent = 'レ';
                }
            }
            document.querySelectorAll('tbody > tr[data-des="arr"] > td[data-passage="true"]').forEach(td => {
                td.setAttribute('rowspan', 2);
            });
            document.querySelectorAll('tbody > tr[data-des="dep"] > td[data-passage="true"]').forEach(td => {
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