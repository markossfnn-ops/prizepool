const loginScreen =
    document.getElementById("loginScreen");

const adminScreen =
    document.getElementById("adminScreen");

const loginForm =
    document.getElementById("loginForm");

const passwordInput =
    document.getElementById("password");

const loginMessage =
    document.getElementById("loginMessage");

const adminForm =
    document.getElementById("adminForm");

const logoutButton =
    document.getElementById("logoutButton");

const resetButton =
    document.getElementById("resetButton");

const resetValue =
    document.getElementById("resetValue");

const message =
    document.getElementById("message");


let adminPassword = null;


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const password =
            passwordInput.value;

        if (!password) {
            return;
        }

        loginMessage.textContent =
            "Comprobando...";

        loginMessage.style.color =
            "#888";

        try {

            const response =
                await fetch(
                    "/api/admin/test",
                    {
                        method: "GET",

                        headers: {
                            "Authorization":
                                `Bearer ${password}`
                        }
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                loginMessage.textContent =
                    "❌ Contraseña incorrecta.";

                loginMessage.style.color =
                    "#ff4c4c";

                return;
            }

            if (data.success !== true) {

                loginMessage.textContent =
                    "❌ No se pudo iniciar sesión.";

                loginMessage.style.color =
                    "#ff4c4c";

                return;
            }

            // CONTRASEÑA CORRECTA

            adminPassword =
                password;

            loginScreen.classList.add(
                "hidden"
            );

            adminScreen.classList.remove(
                "hidden"
            );

            loginMessage.textContent = "";

            await loadSettings();

        } catch (error) {

            console.error(
                "Error de login:",
                error
            );

            loginMessage.textContent =
                "❌ Error conectando con el servidor.";

            loginMessage.style.color =
                "#ff4c4c";
        }
    }
);


// ========================================
// CARGAR CONFIGURACIÓN
// ========================================

async function loadSettings() {

    try {

        const response =
            await fetch(
                "/api/stats"
            );

        if (!response.ok) {
            throw new Error(
                "Error obteniendo estadísticas."
            );
        }

        const data =
            await response.json();

        document.getElementById(
            "title"
        ).value = data.title;

        document.getElementById(
            "currency"
        ).value = data.currency;

        document.getElementById(
            "value"
        ).value = data.value;

        document.getElementById(
            "increment"
        ).value = data.increment;

        resetValue.value =
            data.value;

    } catch (error) {

        console.error(error);

        showMessage(
            "❌ Error cargando configuración.",
            true
        );
    }
}


// ========================================
// GUARDAR CONFIGURACIÓN
// ========================================

adminForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const title =
            document.getElementById(
                "title"
            ).value.trim();

        const currency =
            document.getElementById(
                "currency"
            ).value.trim();

        const value =
            Number(
                document.getElementById(
                    "value"
                ).value
            );

        const increment =
            Number(
                document.getElementById(
                    "increment"
                ).value
            );

        try {

            const response =
                await fetch(
                    "/api/admin/settings",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${adminPassword}`
                        },

                        body: JSON.stringify({
                            title,
                            currency,
                            value,
                            increment
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                if (
                    response.status === 401
                ) {
                    logout();
                    return;
                }

                throw new Error(
                    data.error ||
                    "Error guardando."
                );
            }

            showMessage(
                "✅ Cambios guardados correctamente."
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "❌ " + error.message,
                true
            );
        }
    }
);


// ========================================
// RESET CONTADOR
// ========================================

resetButton.addEventListener(
    "click",
    async () => {

        const value =
            Number(
                resetValue.value
            );

        if (
            Number.isNaN(value) ||
            value < 0
        ) {

            showMessage(
                "❌ Valor no válido.",
                true
            );

            return;
        }

        const confirmed =
            confirm(
                `¿Seguro que quieres resetear el contador a ${value}?`
            );

        if (!confirmed) {
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
                                "application/json",

                            "Authorization":
                                `Bearer ${adminPassword}`
                        },

                        body: JSON.stringify({
                            value
                        })
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {

                if (
                    response.status === 401
                ) {
                    logout();
                    return;
                }

                throw new Error(
                    data.error ||
                    "Error reseteando."
                );
            }

            document.getElementById(
                "value"
            ).value =
                data.data.value;

            resetValue.value =
                data.data.value;

            showMessage(
                "✅ Contador reseteado correctamente."
            );

        } catch (error) {

            console.error(error);

            showMessage(
                "❌ " + error.message,
                true
            );
        }
    }
);


// ========================================
// CERRAR SESIÓN
// ========================================

logoutButton.addEventListener(
    "click",
    logout
);

function logout() {

    adminPassword = null;

    passwordInput.value = "";

    adminScreen.classList.add(
        "hidden"
    );

    loginScreen.classList.remove(
        "hidden"
    );

    loginMessage.textContent = "";

    message.textContent = "";
}


// ========================================
// MENSAJES
// ========================================

function showMessage(
    text,
    error = false
) {

    message.textContent =
        text;

    message.style.color =
        error
            ? "#ff4c4c"
            : "#4cff88";

    setTimeout(
        () => {
            message.textContent = "";
        },
        3000
    );
}