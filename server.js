const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const database = require("./database/database");
const config = require("./config.json");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});


// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());


// ==============================
// ARCHIVOS DEL FRONTEND
// ==============================

// Página principal
app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// Panel de administración
app.use(
    "/admin",
    express.static(
        path.join(__dirname, "admin")
    )
);


// ==============================
// PÁGINA ADMIN
// ==============================

app.get("/admin", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "admin",
            "admin.html"
        )
    );

});


// ==============================
// OBTENER DATOS
// ==============================

app.get("/api/stats", async (req, res) => {

    try {

        const settings =
            await database.getSettings();

        res.json(settings);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Error obteniendo los datos"
        });

    }

});


// ==============================
// SUMAR INVITACIÓN
// ==============================

app.post("/api/invitation", async (req, res) => {

    try {

        const settings =
            await database.addInvitation();

        io.emit(
            "counterUpdate",
            settings
        );

        res.json({
            success: true,
            data: settings
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Error aumentando el contador"
        });

    }

});


// ==============================
// ADMIN - CAMBIAR CONFIGURACIÓN
// ==============================

app.post(
    "/api/admin/settings",
    async (req, res) => {

        try {

            const {
                title,
                currency,
                value,
                increment
            } = req.body;


            if (
                !title ||
                !currency ||
                Number.isNaN(Number(value)) ||
                Number.isNaN(Number(increment)) ||
                Number(value) < 0 ||
                Number(increment) < 1
            ) {

                return res.status(400).json({
                    error: "Datos no válidos"
                });

            }


            await database.updateSettings(
                title,
                currency,
                Number(value),
                Number(increment)
            );


            const settings =
                await database.getSettings();


            io.emit(
                "counterUpdate",
                settings
            );


            res.json({
                success: true,
                data: settings
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Error guardando configuración"
            });

        }

    }
);


// ==============================
// ADMIN - RESET
// ==============================

app.post(
    "/api/admin/reset",
    async (req, res) => {

        try {

            const value =
                Number(req.body.value);


            if (
                Number.isNaN(value) ||
                value < 0
            ) {

                return res.status(400).json({
                    error: "Valor no válido"
                });

            }


            const settings =
                await database.resetCounter(value);


            io.emit(
                "counterUpdate",
                settings
            );


            res.json({
                success: true,
                data: settings
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                error:
                    "Error reseteando contador"
            });

        }

    }
);


// ==============================
// SOCKET.IO
// ==============================

io.on(
    "connection",
    async (socket) => {

        console.log(
            "Cliente conectado:",
            socket.id
        );


        try {

            const settings =
                await database.getSettings();


            socket.emit(
                "counterUpdate",
                settings
            );

        } catch (error) {

            console.error(error);

        }


        socket.on(
            "disconnect",
            () => {

                console.log(
                    "Cliente desconectado:",
                    socket.id
                );

            }
        );

    }
);


// ==============================
// INICIAR SERVIDOR
// ==============================

server.listen(
    config.port,
    () => {

        console.log(
            `Servidor iniciado en http://localhost:${config.port}`
        );

        console.log(
            `Panel admin: http://localhost:${config.port}/admin`
        );

    }
);