window.addEventListener('DOMContentLoaded', () => {
    const stationDialog = document.getElementById('station-dialog');
    const loadingDialog = document.getElementById('loading-dialog');
    const progressBar = document.getElementById('progress');
    const stationProgressBar = document.getElementById('station-progress');

    const hidden = 'hidden';

    const allStations = [];

    async function getRouteName() {
        document.querySelectorAll('main > section:nth-child(n + 2)').forEach(elem => {
            elem.classList.add(hidden);
        });

        const name = document.getElementById('route-name').value;
        if (name.length === 0) {
            alert('路線名を入力してください。');
            return;
        }

        loadingDialog.showModal();

        const response = await fetch(`./api/route-names?name=${name}`);
        const json = await response.json();
        if (json.length === 0) {
            loadingDialog.close();
            alert('路線が見つかりませんでした。');
            return;
        }

        console.log(json);

        const routeListElem = document.getElementById('route-list');
        routeListElem.textContent = '';
        json.forEach(item => {
            const optionElem = document.createElement('option');
            optionElem.value = item.id;
            optionElem.textContent = item.name;
            routeListElem.appendChild(optionElem);
        });
        routeListElem.focus();
        loadingDialog.close();
        if (json.length === 1) {
            routeListElem['disabled'] = true;
            getTimetableList();
        }
        document.getElementById('route-list-section').classList.remove(hidden);
    }

    async function getTimetableList() {
        document.querySelectorAll('main > section:nth-child(n + 3)').forEach(elem => {
            elem.classList.add(hidden);
        });

        loadingDialog.showModal();

        const id = document.getElementById('route-list').value;
        const response = await fetch(`./api/timetables?id=${id}`);
        const json = await response.json();
        console.log(json);

        const timetableListElem = document.getElementById('timetable-list');
        timetableListElem.textContent = '';
        const template = document.getElementById('timetable-list-template');
        json.forEach(item => {
            const clone = template.content.cloneNode(true);
            const id = `timetable-${item.number}`;
            clone.querySelector('[type="checkbox"]').id = id;
            clone.querySelector('[type="checkbox"]').value = item.number;
            clone.querySelector('label').setAttribute('for', id);
            clone.querySelector('label').textContent = item.name;
            timetableListElem.appendChild(clone);
        });
        document.getElementById('timetable-list-section').classList.remove(hidden);

        loadingDialog.close();
    }

    async function getTrains(id, numbers) {
        let i = 0;
        const interval = setInterval(() => {
            stationProgressBar.value = i;
            i++;
        }, 100);

        const response = await fetch(`http://localhost/toretabi-scraping/api/trains/?route_id=${id}&timetable_number=${numbers.join(',')}`);
        const text = await response.text();
        clearInterval(interval);
        console.log(text);
        return text;
    }

    /**
     * 
     * @param {Array} jsons 
     */
    async function showStations(jsons) {
        console.log(jsons);
        document.getElementById('timetable-names').textContent = '';
        document.getElementById('stations').textContent = '';
        allStations.length = 0;
        let i = 1;
        let left = 1.5;
        const template = document.getElementById('station-template');
        jsons.forEach(json => {
            const li = document.createElement('li');
            li.style.marginLeft = `${left + 1}rem`;
            const span = document.createElement('span');
            span.textContent = document.querySelector(`[for="timetable-${json.number}"]`).textContent;
            li.appendChild(span);
            document.querySelector('#timetable-names').appendChild(li);

            json.stations.forEach(station => {
                const id = `station-${station.id}`;
                const name = station.name;
                const span = document.createElement('span');
                span.textContent = name;
                if (document.getElementById(`${id}`) !== null) {
                    document.querySelector(`#${id} + label`).appendChild(span);
                    return;
                }
                allStations.push(station);
                const clone = template.content.cloneNode(true);
                const checkbox = clone.querySelector('[type="checkbox"]');
                checkbox.id = id;
                checkbox.dataset.station = station.id;
                const label = clone.querySelector('label');
                label.setAttribute('for', id);
                label.style.marginLeft = `${left}rem`;
                label.appendChild(span);
                document.getElementById('stations').appendChild(clone);
            });
            left += Math.max(...(json.stations.map(station => station.name.length)));
            document.querySelectorAll(`#stations span:nth-child(${i})`).forEach(span => {
                span.style.width = `${left - 1.5}rem`;
            });
            i++;
        });
        stationDialog.showModal();
    }

    Sortable.create(document.getElementById('stations'), {
        animation: 150,
        handle: '.mi-drag_handle'
    });

    async function getTimetables() {
        document.querySelectorAll('main > section:nth-child(n + 4)').forEach(elem => {
            elem.classList.add(hidden);
        });

        const id = document.getElementById('route-list').value;
        console.log(id);
        const numbers = [];
        document.querySelectorAll('#timetable-list [type="checkbox"]:checked').forEach(elem => numbers.push(elem.value));
        const jsons = await Promise.all(numbers.map(number => fetch(`http://localhost/toretabi-scraping/api/trains/?route_id=${id}&timetable_number=${number}&count=true`).then(response => response.json())));
        console.log(jsons);
        Object.keys(jsons).forEach(i => {
            jsons[i].number = numbers[i];
        });

        const count = jsons.reduce((sum, json) => sum + json.count, 0);
        if (!confirm(`列車情報取得まで${count}秒かかります。\n取得を実施しますか？`)) {
            loadingDialog.close();
            return;
        }

        stationProgressBar.setAttribute('max', (count * 10) + 30);
        stationProgressBar.classList.remove('hidden');

        const submit = document.querySelector('#to-timetable > [type="submit"]');
        submit['disabled'] = true;
        const [text] = await Promise.all([getTrains(id, numbers), showStations(jsons)]);

        console.log(JSON.parse(text));
        stationProgressBar.classList.add('hidden');

        sessionStorage.setItem('routeName', document.getElementById('route-name').value);
        sessionStorage.setItem('routeId', document.getElementById('route-list').value);
        sessionStorage.setItem('trains', text);

        submit['disabled'] = false;
    }

    document.getElementById('route-name-form').addEventListener('submit', e => {
        e.preventDefault();
        getRouteName();
    });

    document.getElementById('route-list-form').addEventListener('submit', e => {
        e.preventDefault();
        getTimetableList();
    });

    document.getElementById('timetable-list-form').addEventListener('submit', e => {
        e.preventDefault();
        getTimetables();
    });

    document.getElementById('cancel').addEventListener('click', () => {
        stationDialog.close();
    });

    document.getElementById('to-timetable').addEventListener('submit', e => {
        // e.preventDefault();
        const stations = [];
        document.querySelectorAll('#stations [type="checkbox"]:checked').forEach(checkbox => {
            const stationId = Number(checkbox.dataset.station);
            stations.push(allStations.find(station => station.id === stationId));
        });
        sessionStorage.setItem('stations', JSON.stringify(stations));
    });
});