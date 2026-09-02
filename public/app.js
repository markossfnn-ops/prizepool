const socket = io();

const titleElement =
    document.getElementById("title");

const valueElement =
    document.getElementById("value");

const currencyElement =
    document.getElementById("currency");

const incrementElement =
    document.getElementById("increment");

const invitationsElement =
    document.getElementById("invitations");

const counterElement =
    document.getElementById("counter");

const notification =
    document.getElementById("notification");

let currentValue = 0;


function formatNumber(number) {

    return new Intl.NumberFormat("es-ES")
        .format(number);

}


function updateCounter(data) {

    const oldValue = currentValue;

    currentValue = data.value;

    titleElement.textContent =
        data.title;

    valueElement.textContent =
        formatNumber(data.value);

    currencyElement.textContent =
        data.currency;

    incrementElement.textContent =
        formatNumber(data.increment);

    invitationsElement.textContent =
        formatNumber(data.invitations);


    if (
        data.value > oldValue &&
        oldValue !== 0
    ) {

        counterElement.classList.remove("bump");

        void counterElement.offsetWidth;

        counterElement.classList.add("bump");

        showNotification(
            `+${formatNumber(data.increment)}`
        );

    }

}


function showNotification(text) {

    notification.textContent = text;

    notification.classList.add("show");

    setTimeout(() => {

        notification.classList.remove("show");

    }, 1500);

}


socket.on(
    "counterUpdate",
    updateCounter
);


fetch("/api/stats")

    .then(response => response.json())

    .then(data => {

        updateCounter(data);

    })

    .catch(error => {

        console.error(
            "Error cargando estadísticas:",
            error
        );

    });