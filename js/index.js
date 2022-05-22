window.addEventListener('DOMContentLoaded', () => {
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
            clone.querySelector('[type="radio"]').id = id;
            clone.querySelector('[type="radio"]').value = item.number;
            clone.querySelector('label').setAttribute('for', id);
            clone.querySelector('label').textContent = item.name;
            timetableListElem.appendChild(clone);
        });
        document.querySelector('#timetable-list-section').classList.remove(hidden);

        loadingDialog.close();
    }

    async function getTrins() {
        document.querySelectorAll('main > section:nth-child(n + 4)').forEach(elem => {
            elem.classList.add(hidden);
        });

        loadingDialog.showModal();

        const id = document.querySelector('#route-list').value;
        const number = document.querySelector('[name="timetable"]:checked').value;
        const countResponse = await fetch(`http://localhost/toretabi-scraping/api/trains/?route_id=${id}&timetable_number=${number}&count=true`);
        const countJson = await countResponse.json();
        console.log(countJson);

        if (!confirm(`列車情報取得まで${countJson.count}秒かかります。\n取得を実施しますか？`)) {
            loadingDialog.close();
            return;
        }

        progressBar.setAttribute('max', (countJson.count * 10) + 30);

        let i = 0;
        const interval = setInterval(() => {
            progressBar.value = i;
            i++;
        }, 100);

        const response = await fetch(`http://localhost/toretabi-scraping/api/trains/?route_id=${id}&timetable_number=${number}`);
        const text = await response.text();
        clearInterval(interval);
        console.log(text);
        console.log(JSON.parse(text));

        loadingDialog.close();

        sessionStorage.setItem('trains', text);
        location.href = 'timetable.html';
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
        getTrins();
    });
});