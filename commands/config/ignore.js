const Discord = require("discord.js"); 
const { loading } = require("../../data/emojis.json");
const replies = require("../../data/replies.json");
const { invisible } = require("../../data/colors.json");
const servers = require("../../models/server.js");
const mongoose = require("mongoose");
const mongoUrl = require("../../tokens.json").mongodb;

mongoose.connect(mongoUrl, {
  useNewUrlParser: true
});

module.exports = {
  name: "ignore",
  description: "The bot will stop responding to commands from the channel.",
  usage: "<channel>",
  args: true,
  async execute (client, message, args) {
    if (!message.member.hasPermission("MANAGE_CHANNELS")) return message.channel.send(`You must have the \`Manage Channels\` permission to use this command.`);

    const msg = await message.channel.send(`${loading} Ignoring commands from channel...`);
    
    let channel;
    if(message.mentions.channels.first() === undefined){
        if(!isNaN(args[0])) channel = args[0];
        else msg.edit("No channel detected.");
    } else {
        channel = message.mentions.channels.first().id;
    }

    servers.findOne({
        serverID: message.guild.id
    }, async (err, s) => {
        if (err) console.log(err);
        if (!s) {
            const newSever = new servers({
              serverID: message.guild.id,
              prefix: "e.",
              feed: "",
              ignore: [],                    
            });
            await newSever.save().catch(e => console.log(e));
        }

        if(s.ignore.includes(channel)) return msg.edit("I am already ignoring this channel!");
        s.ignore.push(channel);
        await s.save().catch(e => console.log(e));
        const embed = new Discord.RichEmbed()
        .setAuthor(`${message.guild.name}`, message.guild.iconURL)
        .setColor(invisible)
        .setDescription(`**I will now ignore commands from ${args[0]}**\nTip: You can make me listen to commands again by doing \`${s.prefix}listen\``);
        msg.edit(embed);
    });
  },
};