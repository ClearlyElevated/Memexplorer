const Discord = require("discord.js");
const { loading, upvote, downvote } = require("../../data/emojis.json"); 

module.exports = {
  name: "filename",
  async execute (client, message, args) { 
    try {
        const msg = await message.channel.send(`${loading} Fetching file name...`);
        const attachment = message.attachments.first();
        msg.edit(attachment.filename);
    } catch (error) {
        console.log(error);
    }
  }
};