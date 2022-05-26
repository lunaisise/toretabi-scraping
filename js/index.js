window.addEventListener('DOMContentLoaded', () => {
    const stationDialog = document.querySelector('#station-dialog');
    const loadingDialog = document.querySelector('#loading-dialog');
    const progressBar = document.querySelector('#progress');

    const hidden = 'hidden';

    async function getRouteName() {
        document.querySelectorAll('main > section:nth-child(n + 2)').forEach(elem => {
            elem.classList.add(hidden);
        });

        const name = document.querySelector('#route-name').value;
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

        const routeListElem = document.querySelector('#route-list');
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
        document.querySelector('#route-list-section').classList.remove(hidden);
    }

    async function getTimetableList() {
        document.querySelectorAll('main > section:nth-child(n + 3)').forEach(elem => {
            elem.classList.add(hidden);
        });

        loadingDialog.showModal();

        const id = document.querySelector('#route-list').value;
        const response = await fetch(`./api/timetables?id=${id}`);
        const json = await response.json();
        console.log(json);

        const timetableListElem = document.querySelector('#timetable-list');
        timetableListElem.textContent = '';
        const template = document.querySelector('#timetable-list-template');
        json.forEach(item => {
            const clone = template.content.cloneNode(true);
            const id = `timetable-${item.number}`;
            clone.querySelector('[type="checkbox"]').id = id;
            clone.querySelector('[type="checkbox"]').value = item.number;
            clone.querySelector('label').setAttribute('for', id);
            clone.querySelector('label').textContent = item.name;
            timetableListElem.appendChild(clone);
        });
        document.querySelector('#timetable-list-section').classList.remove(hidden);

        loadingDialog.close();
    }

    async function getTrains(id, numbers) {
        let i = 0;
        const interval = setInterval(() => {
            progressBar.value = i;
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
        document.querySelector('#timetable-names').textContent = '';
        document.querySelector('#stations').textContent = '';
        let i = 1;
        let left = 1.5;
        const template = document.querySelector('#station-template');
        jsons.forEach(json => {
            const li = document.createElement('li');
            li.textContent = document.querySelector(`[for="timetable-${json.number}"]`).textContent;
            li.style.marginLeft = `${left}rem`;
            document.querySelector('#timetable-names').appendChild(li);
            json.stations.forEach(station => {
                const id = `station-${station.id}`;
                const name = station.name;
                const span = document.createElement('span');
                span.textContent = name;
                // console.log(document.querySelector(`#${id}`));
                if (document.querySelector(`#${id}`) !== null) {
                    document.querySelector(`#${id} + label`).appendChild(span);
                    return;
                }
                const clone = template.content.cloneNode(true);
                clone.querySelector('[type="checkbox"]').id = id;
                const label = clone.querySelector('label');
                label.setAttribute('for', id);
                label.style.marginLeft = `${left}rem`;
                label.appendChild(span);
                document.querySelector('#stations').appendChild(clone);
            });
            left += Math.max(...(json.stations.map(station => station.name.length)));
            document.querySelectorAll(`#stations span:nth-child(${i})`).forEach(span => {
                span.style.width = `${left - 1.5}rem`;
            });
            i++;
        });
        stationDialog.showModal();
    }

    async function getTimetables() {
        document.querySelectorAll('main > section:nth-child(n + 4)').forEach(elem => {
            elem.classList.add(hidden);
        });

        const id = document.querySelector('#route-list').value;
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

        // progressBar.setAttribute('max', (count * 10) + 30);

        const submit = document.querySelector('#to-timetable > [type="submit"]');
        submit['disabled'] = true;
        const [text] = await Promise.all([getTrains(id, numbers), showStations(jsons)]);

        console.log(JSON.parse(text));

        sessionStorage.setItem('routeName', document.querySelector('#route-name').value);
        sessionStorage.setItem('routeId', document.querySelector('#route-list').value);
        sessionStorage.setItem('trains', text);

        submit['disabled'] = false;
    }

    document.querySelector('#route-name-form').addEventListener('submit', e => {
        e.preventDefault();
        getRouteName();
    });

    document.querySelector('#route-list-form').addEventListener('submit', e => {
        e.preventDefault();
        getTimetableList();
    });

    document.querySelector('#timetable-list-form').addEventListener('submit', e => {
        e.preventDefault();
        getTimetables();
    });

    document.querySelector('#cancel').addEventListener('click', () => {
        stationDialog.close();
    });

    document.querySelector('#to-timetable').addEventListener('submit', () => {

    });
});