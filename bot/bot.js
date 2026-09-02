const {
    Client,
    GatewayIntentBits
} = require("discord.js");

const database =
    require("../database/database");


const TOKEN =
    process.env.DISCORD_TOKEN;

const GUILD_ID =
    process.env.GUILD_ID;


if (!TOKEN) {
    console.error(
        "ERROR: Falta DISCORD_TOKEN"
    );

    process.exit(1);
}

if (!GUILD_ID) {
    console.error(
        "ERROR: Falta GUILD_ID"
    );

    process.exit(1);
}


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});


const invitesCache = new Map();


// ==============================
// CACHE INVITES
// ==============================

async function cacheInvites(guild) {

    try {

        const invites =
            await guild.invites.fetch();

        const inviteMap =
            new Map();

        for (
            const invite
            of invites.values()
        ) {

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
// BOT READY
// ==============================

client.once(
    "clientReady",
    async () => {

        console.log(
            `Bot conectado como ${client.user.tag}`
        );

        const guild =
            client.guilds.cache.get(
                GUILD_ID
            );

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

    }
);


// ==============================
// NEW MEMBER
// ==============================

client.on(
    "guildMemberAdd",
    async (member) => {

        try {

            if (
                member.guild.id !==
                GUILD_ID
            ) {
                return;
            }

            console.log(
                `Nuevo miembro: ${member.user.tag}`
            );


            const invites =
                await member.guild.invites.fetch();

            const oldInvites =
                invitesCache.get(
                    member.guild.id
                ) || new Map();


            let usedInvite = null;


            for (
                const invite
                of invites.values()
            ) {

                const oldUses =
                    oldInvites.get(
                        invite.code
                    ) || 0;

                const newUses =
                    invite.uses || 0;


                if (
                    newUses >
                    oldUses
                ) {

                    usedInvite =
                        invite;

                    break;

                }

            }


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


            if (
                usedInvite.inviter
            ) {

                console.log(
                    `Invitado por: ${usedInvite.inviter.tag}`
                );

            }


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


client.login(TOKEN);