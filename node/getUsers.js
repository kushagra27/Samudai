const express = require('express')
var cors = require('cors')
const bodyParser = require("body-parser");
var admin = require("firebase-admin");

const app = express()
const port = 3001
app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const { Client, Intents, Guild } = require('discord.js');
require('dotenv').config();
const commandHandler = require('./commands')
const fetch = require('node-fetch');



var serviceAccount = require("./creds.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore()


const client = new Client({ 
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_PRESENCES", "GUILD_MEMBERS"] 
});


client.once('ready', async (data) => {
	console.log('Ready!');
    console.log(`Logged in as ${client.user.tag}!`);
    
    const Guilds = client.guilds.cache.map(guild => guild);
    // console.log(Guilds[1]);

    // Final Working code Members
    // await Guilds[0].members.fetch({limit: 100})
    // .then(fetchedMembers =>{
    //     console.log(fetchedMembers)
    // })
    // .catch(console.error)

    // Working code Roles
    // await Guilds[0].roles.fetch()
    // .then((roles,i) => {
    //     // console.log(roles)
    //     const arr = Array.from(roles)
    //     const values = Object.values(Object.fromEntries(roles))
    //     values.map((item, i) => {
    //         const {id, name, color, hoist, rawPosition, permissions, managed, mentionable, deleted, tags} = item
    //         const obj = {
    //             id, 
    //             name, 
    //             color, 
    //             hoist, 
    //             rawPosition,
    //             permissions, 
    //             managed, 
    //             mentionable, 
    //             deleted, 
    //             tags
    //         }
    //         // console.log(JSON.stringify(obj))
    //     })
    // })
});

client.on('interactionCreate', async interaction => {
    // console.log(interaction)
    if (!interaction.isCommand()) return;

    if (interaction.commandName === 'ping') {
        // await interaction.reply('Pong!');
        await interaction.reply(client.user + '💖');
    }
});

client.on("messageCreate", async (message) => {
    // if (message.author.id == client.user.id) return;
    let tokens = message.content.split(" ");
    // console.log(message)
    if (tokens[0] == "$listmids") {
        // console.log(client.users)
        // const users = client.users.cache.map(u => {console.log(u);console.log(u.id)});
        // console.log(`Listing user ids from all guilds:`);
        // console.log(users);
    } 
    else if (tokens[0] == "!gif") {
        let keywords = 'coding train'
        if( tokens.length > 1 ) {
            keywords = tokens.slice(1).join(" ");
        }
        let url = `https://api.tenor.com/v1/search?q=${keywords}&key=${process.env.TENOR_KEY}`
        let response = await fetch(url);
        let json = await response.json();
        // console.log(json)
        message.channel.send(json.results[0].url)
        // const channelMessages = await message.channelMessages.channelMessages.fetch({limit:100})
        // console.log(channelMessages)
    } else if (tokens[0] == "!rewards") {
        var returnURL = "http://localhost:3000/claim"
        await db.collection("discordBot").where('command', '==', 'rewards').get().then(qs =>{
            qs.forEach(doc => {
                returnURL = doc.data().returnURL
            })
        })
        const guildId = message.guild.id
        message.reply(`${returnURL}?guildId=${guildId}&userId=${message.author.id}`)
    } else if (tokens[0] == "!configure") {
        var returnURL = "http://localhost:3000/"
        await db.collection("discordBot").where('command', '==', 'configure').get().then(qs =>{
            qs.forEach(doc => {
                returnURL = doc.data().returnURL
            })
        })
        const guildId = message.guild.id
        message.reply(`${returnURL}?guildId=${guildId}&userId=${message.author.id}`)
    }

    if(tokens[0] == 'test'){
        // const guildId = message.guild.id
        // const guild = client.guilds.cache.get(guildId)
        const Guilds = await client.guilds.cache.map(guild => guild);
        // console.log(Guilds)
        Guilds.forEach(item =>{
            console.log(item.id)
        })
        // console.log(guild.members.cache.get('587414687734562818'))
    }

    if (tokens[0] == "ping") {
        console.log(message.content)
        console.log(message.createdAt)
        message.reply("Pong!");
    }
});

app.get('/members', async (req, res) => {
    console.log('request GET /members')
    var guildId = req.query.guildId
    const Guilds = await client.guilds.cache.map(guild => guild);
    var guild = ''
    Guilds.forEach(item =>{
        // console.log(item.id)
        if(guildId === item.id)
            guild = item
    })

    // console.log(Guilds[1].memberCount);

    // Working code Roles
    // await Guilds[0].roles.fetch()
    // .then((roles,i) => {
    //     // console.log(roles)
    //     const arr = Array.from(roles)
    //     const values = Object.values(Object.fromEntries(roles))
    //     const returnData = values.map((item, i) => {
    //         const {id, name, color, hoist, rawPosition, permissions, managed, mentionable, deleted, tags} = item
    //         const obj = {
    //             id, 
    //             name, 
    //             color, 
    //             hoist, 
    //             rawPosition,
    //             permissions, 
    //             managed, 
    //             mentionable, 
    //             deleted, 
    //             tags
    //         }
    //         return obj
    //         // console.log(JSON.stringify(obj))
    //     })
    // })
    res.setHeader('Content-Type', 'application/json');
    res.send({memberCount: guild.memberCount})
})

app.get('/roles', async (req, res) => {
    console.log('request GET /roles')
    var guildId = req.query.guildId
    const Guilds = await client.guilds.cache.map(guild => guild);
    var guild = ''
    Guilds.forEach(item =>{
        // console.log(item.id)
        if(guildId === item.id)
            guild = item
    })

    // Working code Roles
    await guild.roles.fetch()
    .then((roles,i) => {
        // console.log(roles)
        const arr = Array.from(roles)
        const values = Object.values(Object.fromEntries(roles))
        const returnData = values.map((item, i) => {
            const {id, name, color, hoist, rawPosition, permissions, managed, mentionable, deleted, tags} = item
            const obj = {
                id, 
                name, 
                color, 
                hoist, 
                rawPosition,
                permissions, 
                managed, 
                mentionable, 
                deleted, 
                tags
            }
            return obj
            // console.log(JSON.stringify(obj))
        })
        res.setHeader('Content-Type', 'application/json');
        res.send(returnData)
    })
})

app.post('/addToRole', (req, res) => {
    // console.log(req.body)
    const guildId = req.body.guildId
    const guild = client.guilds.cache.get(guildId)
    const member = guild.members.cache.get(req.body.userId)
    member.roles.add(req.body.roleId);
    res.end('Added Successfully');
})

app.get('/healthCheck', async (req, res) => {
    console.log('request GET /healthCheck')
    
    res.setHeader('Content-Type', 'application/json');
    res.send({'status': 200})
})


client.login(process.env.BOT_TOKEN); // Kushagra's bot

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})