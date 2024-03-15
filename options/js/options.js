function llenarCampos() {
    function onReady(cuotas) {
        for (let cuota in cuotas) {
            if (cuota == cuenta) {
                document.querySelector('#username').value = cuotas[cuota].username;
                document.querySelector('#userpassword').value = atob(cuotas[cuota].userpassword);
            }
        }
    }

    function onError(error) {
        console.log('Error: ' + $(error));
    }

    var cuotas = browser.storage.local.get();
    cuotas.then(onReady, onError);
}

function saveCred() {
    try {
        let json = JSON.parse('{"' + cuenta + '": {"username": "' + document.querySelector('#username').value + '", "userpassword": "' + btoa(document.querySelector('#userpassword').value) + '", "proxy": "' + false + '"} }');
        browser.storage.local.set(json);
    }
    catch {
        alert('Seleccione una cuenta');
    }
}

function togglePass() {
    if (document.querySelector('#userpassword').getAttribute('type') == 'password')
        document.querySelector('#userpassword').setAttribute('type', 'text');
    else
        document.querySelector('#userpassword').setAttribute('type', 'password');
}

function addCuota() {
    let idc = document.querySelector('#idc');
    if (idc.value == '') {
        idc.setAttribute('class', 'form-control is-invalid me-2 fs-4');
        idc.setAttribute('placeholder', 'Campo vacio');
    }
    else {
        let json = JSON.parse('{"' + idc.value + '": {"username": "", "userpassword": ""} }');

        idc.setAttribute('class', 'form-control me-2 fs-4');
        idc.setAttribute('placeholder', 'Identificador');

        browser.storage.local.set(json);

        cuenta = idc.value;
        updateList();
        document.querySelector('#idc').value = '';
    }
}

function delCuota() {
    try {
        browser.storage.local.remove(cuenta);
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
        if ($(this).text() != cuenta)
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
            let newItem = document.createElement('li');

            newItem.setAttribute('id', 'items');
            newItem.textContent = cuota;
            if (typeof cuenta != 'undefined' && cuota == cuenta) {
                newItem.className = 'list-group-item active';
                document.querySelector('#username').value = '';
                document.querySelector('#userpassword').value = '';
            }
            else
                newItem.className = 'list-group-item';
            listContainer.appendChild(newItem);
        }
    }

    function onError(error) {
        console.log('Error: ' + $(error));
    }

    var cuotas = browser.storage.local.get();
    cuotas.then(addItems, onError);
}

document.addEventListener('DOMContentLoaded', updateList);
document.querySelector('#addc').addEventListener('click', addCuota);
document.querySelector('#delc').addEventListener('click', delCuota);
document.querySelector('#seePass').addEventListener('click', togglePass);
document.querySelector('#username').addEventListener('blur', saveCred);

document.addEventListener('keydown', (event) => {
    if (event.code == "Enter")
        addCuota();
})

document.querySelector('#userpassword').addEventListener('blur', function () {
    saveCred();
    if (this.getAttribute('type') == 'text')
        this.setAttribute('type', 'password');
});

document.querySelector('#seePass').addEventListener('blur', function () {
    if (document.querySelector('#userpassword').getAttribute('type') == 'text')
        document.querySelector('#userpassword').setAttribute('type', 'password');
});

document.getElementById('listContainer').addEventListener('click', (event) => {
    let item = event.target.nodeName === 'LI';
    if (!item) {
        return;
    }
    selectCuota(event.target);
});