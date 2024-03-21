function llenarCampos() {
    function onReady(cuotas) {
        for (let cuota in cuotas) {
            if (cuota === cuenta) {
                document.querySelector('#username').value = cuotas[cuota].username;
                document.querySelector('#userpassword').value = atob(cuotas[cuota].userpassword);
            }
        }
    }

    function onError(error) {
        console.log('Error: ' + $(error));
    }

    let cuotas = browser.storage.local.get();
    cuotas.then(onReady, onError);
}

function saveCred() {
    try {
        let json = JSON.parse('{"' + cuenta + '": {"username": "' + document.querySelector('#username').value + '", "userpassword": "' + btoa(document.querySelector('#userpassword').value) + '", "proxy": "' + false + '"} }');
        browser.storage.local.set(json).then();
    }
    catch {
        alert('Seleccione una cuenta');
    }
}

function togglePass() {
    if (document.querySelector('#userpassword').getAttribute('type') === 'password')
        document.querySelector('#userpassword').setAttribute('type', 'text');
    else
        document.querySelector('#userpassword').setAttribute('type', 'password');
}

function addCuota() {
    let idc = document.querySelector('#idc');
    if (idc.value === '') {
        idc.setAttribute('class', 'form-control is-invalid me-2');
        idc.setAttribute('placeholder', 'Campo vacio');
    }
    else {
        let json = JSON.parse('{"' + idc.value + '": {"username": "", "userpassword": ""} }');

        idc.setAttribute('class', 'form-control me-2');
        idc.setAttribute('placeholder', 'Identificador');

        browser.storage.local.set(json).then();

        cuenta = idc.value;
        updateList();
        document.querySelector('#idc').value = '';
    }
}

function delCuota() {
    try {
        browser.storage.local.remove(cuenta).then();
        delete cuenta;
        document.querySelector('#username').value = '';
        document.querySelector('#userpassword').value = '';
        updateList();
    }
    catch {
        alert('Seleccione una cuenta');
    }
}

function selectCuota(item) {
    cuenta = item.textContent;

    $("li").each(function () {
        if ($(this).text() !== cuenta)
            $(this).removeClass('active');
    });

    item.className = 'list-group-item active';
    llenarCampos();
}

function updateList() {
    function addItems(cuotas) {
        let listContainer = document.querySelector('#listContainer');
        listContainer.innerHTML = '';
        for (let cuota in cuotas) {

            if (cuota !== 'proxy') {
                let newItem = document.createElement('li');
                newItem.setAttribute('id', 'items');
                newItem.textContent = cuota;
                if (typeof cuenta != 'undefined' && cuota === cuenta) {
                    newItem.className = 'list-group-item active';
                    document.querySelector('#username').value = '';
                    document.querySelector('#userpassword').value = '';
                } else
                    newItem.className = 'list-group-item';
                listContainer.appendChild(newItem);
            }
        }
    }

    function onError(error) {
        console.log('Error: ' + $(error));
    }

    let cuotas = browser.storage.local.get();
    cuotas.then(addItems, onError);
}

$(() => {
    updateList();
    let $seePassBtn = $('#seePassBtn');
    let $userPassword = $('#userpassword');
    let $usernName = $('#username');

    $('#addAccountBtn').on('click', addCuota);
    $('#delAccountBtn').on('click', delCuota);
    $seePassBtn.on('click', togglePass);
    $usernName.on('blur', saveCred);

    $(document).on('keydown', (event) => {
        if (event.code === 'Enter') {
            addCuota();
        }
    });

    $userPassword.on('blur', function () {
        saveCred();
        if (this.getAttribute('type') === 'text') {
            this.setAttribute('type', 'password');
        }
    });

    $seePassBtn.on('blur', function () {
        if ($userPassword.get(0).getAttribute('type') === 'text') {
            $userPassword.get(0).setAttribute('type', 'text');
        }
    });

    $('#listContainer').on('click', (event) => {
        let item = event.target.nodeName === 'LI';
        if (!item) {
            return;
        }
        selectCuota(event.target);
    });
});