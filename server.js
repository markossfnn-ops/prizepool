const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const database = require("./database/database");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(express.json());

/* =========================
   ADMIN AUTH
========================= */

const ADMIN_PASSWORD =
    process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.warn(
        "ADVERTENCIA: ADMIN_PASSWORD no está configurada."
    );
}

function requireAdmin(req, res, next) {
    const authorization =
        req.headers.authorization || "";

    if (!authorization.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "No autorizado"
        });
    }

    const password =
        authorization.substring(7);

    if (
        !ADMIN_PASSWORD ||
        password !== 03661380
    ) {
        return res.status(401).json({
            error: "Contraseña incorrecta"
        });
    }

    next();
}

/* =========================
   PUBLIC WEBSITE
========================= */

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

/* =========================
   ADMIN PAGE
========================= */

app.get("/admin", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "admin",
            "admin.html"
        )
    );
});

/* =========================
   ADMIN PASSWORD TEST
========================= */

app.get(
    "/api/admin/test",
    requireAdmin,
    (req, res) => {
        res.json({
            success: true
        });
    }
);

/* =========================
   PUBLIC STATS
========================= */

app.get(
    "/api/stats",
    async (req, res) => {
        try {
            const settings =
                await database.getSettings();

            res.json(settings);

        } catch (error) {
            console.error(error);

            res.status(500).json({
                error:
                    "Error obteniendo los datos"
            });
        }
    }
);

/* =========================
   INVITATION
========================= */

app.post(
    "/api/invitation",
    async (req, res) => {
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
                error:
                    "Error aumentando el contador"
            });
        }
    }
);

/* =========================
   ADMIN SETTINGS
========================= */

app.post(
    "/api/admin/settings",
    requireAdmin,
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

/* =========================
   ADMIN RESET
========================= */

app.post(
    "/api/admin/reset",
    requireAdmin,
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
                await database.resetCounter(
                    value
                );

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

/* =========================
   SOCKET.IO
========================= */

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

/* =========================
   SERVER
========================= */

const PORT =
    process.env.PORT || 3000;

server.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `Servidor iniciado en puerto ${PORT}`
        );

    }
);