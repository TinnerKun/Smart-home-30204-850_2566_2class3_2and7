let temperature_stored = [];
let humidity_stored = [];
let gas_stored = [];

function setElementStatus(element, [text, status]) {
    element.innerHTML = text;
    element.classList.remove('text-success', 'text-warning', 'text-danger');
    if (status == 1) element.classList.add('text-success');
    if (status == 2) element.classList.add('text-warning');
    if (status == 3) element.classList.add('text-danger');
}

function setElementValue(element, value) {
    element.innerHTML = value;
}

const socket = io();
socket.on('connect', () => {
    console.log('%c[+ Success +] connected to socket.io server', 'color: #f0e68c');
});
socket.on('data', (response_data) => {
    setElementValue(gas_text, `${parseFloat(response_data.gas_value).toFixed(2)} ppm`);
    setElementValue(flame_text, `${response_data.flame_value ? 'ปกติ' : 'เกิดเหตุการณ์'}`);
    setElementValue(temperature_text, `${parseFloat(response_data.temperature).toFixed(2)} °C`);
    setElementValue(humidity_text, `${parseFloat(response_data.humidity).toFixed(2)} %`);

    if (response_data.gas_value <= 200) setElementStatus(gas_check, ['ปกติ', 1]);
    else if (response_data.gas_value > 200 && response_data.gas_value <= 1000) setElementStatus(gas_check, ['ระดับเสี่ยง', 2]);
    else if (response_data.gas_value > 1000) setElementStatus(gas_check, ['อันตราย', 3]);

    if (response_data.flame_value) setElementStatus(flame_check, ['ปกติ', 1]);
    else setElementStatus(flame_check, ['เกิดเหตุการณ์', 3]);

    if (response_data.temperature < -10) setElementStatus(temperature_check, ['หนาวสุด ๆ, อาจเกิดภาวะแข็งแรงของน้ำ', 3]);
    else if (response_data.temperature >= -10 && response_data.temperature < 0) setElementStatus(temperature_check, ['หนาว, อากาศเย็น', 2]);
    else if (response_data.temperature >= 0 && response_data.temperature < 10) setElementStatus(temperature_check, ['หนาว, อากาศเย็น', 1]);
    else if (response_data.temperature >= 10 && response_data.temperature < 20) setElementStatus(temperature_check, ['หนาว, อากาศเย็น', 2]);
    else if (response_data.temperature >= 20 && response_data.temperature < 30) setElementStatus(temperature_check, ['ปกติ, อากาศเย็น', 1]);
    else if (response_data.temperature >= 30 && response_data.temperature < 40) setElementStatus(temperature_check, ['ร้อน, อากาศร้อน', 2]);
    else if (response_data.temperature >= 40) setElementStatus(temperature_check, ['ร้อนสุด ๆ, อาจเกิดภาวะเหน็บชา', 3]);

    if (response_data.humidity < 20) setElementStatus(humidity_check, ['แห้งสุด ๆ, อาจเกิดภาวะแห้งเหนียว', 3]);
    else if (response_data.humidity >= 20 && response_data.humidity < 40) setElementStatus(humidity_check, ['แห้ง, อาจเกิดภาวะแห้งเหนียว', 2]);
    else if (response_data.humidity >= 40 && response_data.humidity < 60) setElementStatus(humidity_check, ['ปกติ, อาจเกิดภาวะแห้งเหนียว', 1]);
    else if (response_data.humidity >= 60 && response_data.humidity < 80) setElementStatus(humidity_check, ['ชื้น, อาจเกิดภาวะแห้งเหนียว', 2]);
    else if (response_data.humidity >= 80) setElementStatus(humidity_check, ['ชื้นสุด ๆ, อาจเกิดภาวะแห้งเหนียว', 3]);

    temperature.data.labels.push(new Date().toLocaleTimeString());
    humidity.data.labels.push(new Date().toLocaleTimeString());
    gas.data.labels.push(new Date().toLocaleTimeString());

    if (temperature.data.labels.length > 40) temperature.data.labels.shift();
    if (humidity.data.labels.length > 40) humidity.data.labels.shift();
    if (gas.data.labels.length > 40) gas.data.labels.shift();

    temperature.data.datasets[0].data.push(response_data.temperature);
    humidity.data.datasets[0].data.push(response_data.humidity);
    gas.data.datasets[0].data.push(response_data.gas_value);

    if (temperature.data.datasets[0].data.length > 40) temperature.data.datasets[0].data.shift();
    if (humidity.data.datasets[0].data.length > 40) humidity.data.datasets[0].data.shift();
    if (gas.data.datasets[0].data.length > 40) gas.data.datasets[0].data.shift();

    temperature.update();
    humidity.update();
    gas.update();
}
);

let temperatureChart = document.getElementById('temperature-chart').getContext('2d');
let humidityChart = document.getElementById('humidity-chart').getContext('2d');
let gasChart = document.getElementById('gas-chart').getContext('2d');

let temperature = new Chart(temperatureChart, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperature',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

let humidity = new Chart(humidityChart, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Humidity',
            data: [],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

let gas = new Chart(gasChart, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Gas',
            data: [],
            backgroundColor: 'rgba(255, 206, 86, 0.2)',
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 1,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

let uptime = document.getElementById('uptime');
setInterval(() => {
    uptime.innerHTML = `Realtime ${new Date().toLocaleString()}`;
}, 1000);


let setThemeTabble = document.getElementById("overview");

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) setThemeTabble.classList.add("table-dark");
else setThemeTabble.classList.remove("table-dark");

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (e.matches) setThemeTabble.classList.add("table-dark");
    else setThemeTabble.classList.remove("table-dark");
});