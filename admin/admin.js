const form = document.getElementById("adminForm");

const titleInput =
    document.getElementById("title");

const currencyInput =
    document.getElementById("currency");

const valueInput =
    document.getElementById("value");

const incrementInput =
    document.getElementById("increment");

const resetButton =
    document.getElementById("resetButton");

const message =
    document.getElementById("message");


function showMessage(text, success = true) {

    message.textContent = text;

    message.style.color =
        success
            ? "#4cff88"
            : "#ff4c4c";

}


async function loadSettings() {

    try {

        const response =
            await fetch("/api/stats");

        const data =
            await response.json();

        titleInput.value =
            data.title;

        currencyInput.value =
            data.currency;

        valueInput.value =
            data.value;

        incrementInput.value =
            data.increment;

    } catch (error) {

        console.error(error);

        showMessage(
            "No se pudieron cargar los datos",
            false
        );

    }
}


form.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const data = {

            title: titleInput.value,

            currency: currencyInput.value,

            value: Number(
                valueInput.value
            ),

            increment: Number(
                incrementInput.value
            )

        };


        try {

            const response =
                await fetch(
                    "/api/admin/settings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(data)
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                showMessage(
                    result.error ||
                    "Error guardando cambios",
                    false
                );

                return;
            }


            showMessage(
                "Cambios guardados correctamente"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "Error de conexión",
                false
            );

        }

    }
);


resetButton.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "¿Seguro que quieres resetear el contador?"
            );


        if (!confirmed) {
            return;
        }


        const value =
            Number(
                prompt(
                    "¿A qué valor quieres resetearlo?",
                    "0"
                )
            );


        if (Number.isNaN(value) || value < 0) {

            showMessage(
                "Valor no válido",
                false
            );

            return;
        }


        try {

            const response =
                await fetch(
                    "/api/admin/reset",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                value
                            })
                    }
                );


            const result =
                await response.json();


            if (!response.ok) {

                showMessage(
                    result.error ||
                    "Error reseteando",
                    false
                );

                return;
            }


            valueInput.value =
                result.data.value;

            showMessage(
                "Contador reseteado correctamente"
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "Error de conexión",
                false
            );

        }

    }
);


loadSettings();