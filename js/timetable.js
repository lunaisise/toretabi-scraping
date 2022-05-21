window.addEventListener('DOMContentLoaded', () => {
    const {stations, trains} = (() => {
        const text = sessionStorage.getItem('trains');
        const json = JSON.parse(text);
        return {
            stations: json.stations,
            trains: json.trains
        };
    })();

    function setStations() {
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
            const tds = [];
            document.querySelectorAll(`tbody > tr > td[data-id="${trainId}"]`).forEach(td => {
                tds.push(td.textContent.length !== 0);
            });
            console.log(tds);
        });
    }

    (() => {
        console.log({stations, trains});
        setStations();
        setTrains();
    })();
});