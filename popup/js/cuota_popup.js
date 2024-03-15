function makeRequest() {
    function getFields(cuotas) {
        for (let cuota in cuotas) {
            let username = cuotas[cuota].username;
            let userpassword = cuotas[cuota].userpassword;
            let proxy = cuotas[cuota].proxy;
            $.ajax({
                method: 'POST',
                url: 'https://cuota.uci.cu/php/cuota.php',
                data: { username: username, userpassword: userpassword },
                success: function (data) {
                    buildCuota(data, username, userpassword, proxy);

                    //Controlar overflow
                    if (document.body.scrollHeight > document.body.clientHeight) {
                        document.body.style.paddingRight = '15px';
                        document.body.style.overflowX = 'hidden';
                    } else {
                        document.body.style.paddingRight = '0';
                    }
                },
                error: function (error) {
                    console.log(error.statusText);
                    document.querySelector('#user').style.fontSize = '20px';
                }
            });
        }
    }

    function onError(error) {
        console.log('Error: ' + $(error));
    }

    var cuotas = browser.storage.local.get();
    cuotas.then(getFields, onError);
}

function buildCuota(data, username, userpassword, proxyInfo) {
    let empty = document.querySelector('#empty');
    empty.style.display = 'none';

    let container = document.querySelector('#container');
    container.appendChild(document.createElement('hr'));

    let cuotaContainer = document.createElement('div');

    let infoContainer = document.createElement('div');
    infoContainer.className = 'd-flex justify-content-between';

    let proxyContainer = document.createElement('div');
    proxyContainer.className = 'form-check form-switch align-self-center';

    let proxy = document.createElement('input');
    proxy.setAttribute('type', 'radio');
    proxy.className = 'form-check-input';
    proxy.name = 'proxy';
    if (proxyInfo == 'true')
        proxy.checked = true;
    proxyContainer.appendChild(proxy);

    let userInfo = document.createElement('h3');
    userInfo.className = 'text-secondary';

    let infoCuota = document.createElement('h6');
    infoCuota.className = 'text-secondary text-end';

    let infoTime = document.createElement('h6');
    infoTime.className = 'text-secondary';
    infoTime.textContent = '--:--';

    let moreInfo = document.createElement('div');
    moreInfo.className = 'd-flex justify-content-between';

    moreInfo.append(infoTime, infoCuota);

    infoContainer.append(userInfo, proxyContainer);

    let progress = document.createElement('div');
    progress.className = 'progress';
    progress.style = 'height: 20px; font-size: 14px;';

    let progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    progressBar.ariaRoleDescription = 'progressbar';
    progressBar.ariaLabel = 'cuota';
    progressBar.ariaValueNow = '0';
    progressBar.ariaValueMin = '0';
    progressBar.ariaValueMax = '100';
    progressBar.style.width = '0';

    progress.appendChild(progressBar);
    cuotaContainer.append(infoContainer, progress, moreInfo);
    container.appendChild(cuotaContainer);

    try {
        let info = JSON.parse('{'.concat(data.slice(17)).replace('data', '"data"'));
        userInfo.textContent = info.data.usuario;
        infoCuota.textContent = String(Math.round(info.data.cuota_usada)) + '/' + String(info.data.cuota);
        proxy.id = username;

        //Obtener la hora estimada
        let cur_time = new Date().getHours();
        let rem_time = cur_time % 2 == 0 ? Math.ceil(info.data.cuota_usada / info.data.cuota) : Math.floor(info.data.cuota_usada / info.data.cuota);
        let exp_time = cur_time + rem_time;

        //Contar días
        let days = 0;
        let period = '';
        while (exp_time > 24) {
            exp_time = exp_time - 24;
            days++;
        }

        //Corregir paridad
        if (exp_time % 2 != 0)
            exp_time += 1;

        //Obtener el dia exacto
        var currentDate = new Date();
        var millisecondsPerDay = 24 * 60 * 60 * 1000;
        var targetDate = new Date(currentDate.getTime() + (days * millisecondsPerDay));

        //Actualizar periodo
        if (exp_time <= 12)
            period = 'a.m';
        else
            period = 'p.m';

        //Corregir formato
        if (exp_time > 12)
            exp_time = exp_time - 12

        if (info.data.cuota_usada > info.data.cuota) {
            progressBar.className = 'progress-bar bg-danger';
            progressBar.style.width = '100%';
            progressBar.textContent = '+100%';
            if (days > 0)
                infoTime.textContent = String(exp_time).concat(' ', period, ', día ', targetDate.getDate());
            else
                infoTime.textContent = String(exp_time).concat(' ', period);
        }
        else if ((info.data.cuota_usada * 100) / info.data.cuota >= 75 && (info.data.cuota_usada * 100) / info.data.cuota < 89) {
            progressBar.className = 'progress-bar bg-warning';
            progressBar.style.width = String(Math.round((info.data.cuota_usada * 100) / info.data.cuota)).concat('%');
            progressBar.textContent = String(Math.round((info.data.cuota_usada * 100) / info.data.cuota)).concat('%');
        }
        else if ((info.data.cuota_usada * 100) / info.data.cuota >= 89 && (info.data.cuota_usada * 100) / info.data.cuota < 100) {
            progressBar.className = 'progress-bar bg-danger';
            progressBar.style.width = String(Math.round((info.data.cuota_usada * 100) / info.data.cuota)).concat('%');
            progressBar.textContent = String(Math.round((info.data.cuota_usada * 100) / info.data.cuota)).concat('%');
        }
        else {
            progressBar.className = 'progress-bar bg-success';
            progressBar.style.width = String(Math.round((info.data.cuota_usada * 100) / info.data.cuota)).concat('%');
            if (Math.round((info.data.cuota_usada * 100) / info.data.cuota) >= 15)
                progressBar.textContent = String(Math.round((info.data.cuota_usada * 100) / info.data.cuota)).concat('%');
        }
    }
    catch (error) {
        userInfo.textContent = username;
        proxy.disabled = true;
        infoTime.textContent = 'Usuario o contraseña incorrecta';
        infoTime.className = 'text-danger text-center';
        infoTime.style.fontSize = '16px';
    }
}

function updateProxyStatus() {
    function updateProxy(cuotas) {
        for (let cuota in cuotas) {
            if (cuotas[cuota].proxy == 'true') {
                let json = JSON.parse('{"' + cuota + '": {"username": "' + cuotas[cuota].username + '", "userpassword": "' + cuotas[cuota].userpassword + '", "proxy": "' + false + '"} }');
                browser.storage.local.set(json);
            }
            if (cuotas[cuota].username == cuenta.id) {
                let json = JSON.parse('{"' + cuota + '": {"username": "' + cuotas[cuota].username + '", "userpassword": "' + cuotas[cuota].userpassword + '", "proxy": "' + true + '"} }');
                browser.storage.local.set(json);

                localStorage.setItem("credentials", `${cuotas[cuota].username},${cuotas[cuota].userpassword}`);
            }
        }
    }

    function onError(error) {
        console.log('Error: ' + $(error));
    }

    var cuotas = browser.storage.local.get();
    cuotas.then(updateProxy, onError);
}

function setProxy() {
    browser.proxy.settings.set({
        value: {
            proxyType: "manual",
            http: "10.0.0.1:8080",
            httpProxyAll: true,
            passthrough: "localhost, *uci.cu, *uclv.cu, *uclv.edu.cu",
            autoLogin: true,
        }
    });
}

function clearProxy() {
    browser.proxy.settings.set({
        value: {
            proxyType: 'system',
            passthrough: "localhost, *uci.cu, *uclv.cu, *uclv.edu.cu"
        }
    });
}

document.addEventListener('DOMContentLoaded', makeRequest);

var cuenta;
$('#container').click((evt) => {
    if (evt.target && evt.target.matches('input[name="proxy"')) {
        cuenta = evt.target;
        updateProxyStatus();
        if (cuenta.id != 'direct')
            setProxy();
    }
})

document.querySelector('#direct').addEventListener('click', () => {
    let direct = document.querySelector('#direct');

    if (direct.value == 'on') {
        clearProxy();
    }
});