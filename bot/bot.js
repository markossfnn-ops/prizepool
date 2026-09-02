const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const database = require("../database/database");
const config = require("../config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});


// Invitaciones conocidas
const invitesCache = new Map();


// ==============================
// GUARDAR INVITACIONES
// ==============================

async function cacheInvites(guild) {

    try {

        const invites = await guild.invites.fetch();

        const inviteMap = new Map();

        for (const invite of invites.values()) {

            inviteMap.set(
                invite.code,
                invite.uses || 0
            );

        }

        invitesCache.set(
            guild.id,
            inviteMap
        );

        console.log(
            `Invitaciones cargadas: ${inviteMap.size}`
        );

    } catch (error) {

        console.error(
            "No se pudieron cargar las invitaciones:",
            error
        );

    }

}


// ==============================
// BOT LISTO
// ==============================

client.once("clientReady", async () => {

    console.log(
        `Bot conectado como ${client.user.tag}`
    );

    const guild =
        client.guilds.cache.get(config.guildId);

    if (!guild) {

        console.error(
            "No encuentro el servidor configurado."
        );

        return;

    }

    console.log(
        `Servidor configurado: ${guild.name}`
    );

    await cacheInvites(guild);

});


// ==============================
// NUEVO MIEMBRO
// ==============================

client.on(
    "guildMemberAdd",
    async (member) => {

        try {

            if (
                member.guild.id !==
                config.guildId
            ) {
                return;
            }

            console.log(
                `Nuevo miembro: ${member.user.tag}`
            );


            // Invitaciones actuales
            const invites =
                await member.guild.invites.fetch();


            const oldInvites =
                invitesCache.get(
                    member.guild.id
                ) || new Map();


            let usedInvite = null;


            // Buscar la invitación cuyo contador aumentó
            for (const invite of invites.values()) {

                const oldUses =
                    oldInvites.get(
                        invite.code
                    ) || 0;

                const newUses =
                    invite.uses || 0;


                if (newUses > oldUses) {

                    usedInvite = invite;

                    break;

                }

            }


            // Actualizar caché
            await cacheInvites(
                member.guild
            );


            if (!usedInvite) {

                console.log(
                    "No se pudo determinar la invitación utilizada."
                );

                return;

            }


            console.log(
                `Invitación utilizada: ${usedInvite.code}`
            );


            if (usedInvite.inviter) {

                console.log(
                    `Invitado por: ${usedInvite.inviter.tag}`
                );

            }


            // ==============================
            // SUMAR AL PRIZE POOL
            // ==============================

            const settings =
                await database.addInvitation();


            console.log(
                `+${settings.increment} añadido`
            );

            console.log(
                `Prize Pool: ${settings.value}`
            );

        } catch (error) {

            console.error(
                "Error procesando invitación:",
                error
            );

        }

    }
);


// ==============================
// LOGIN
// ==============================

client.login(config.token);