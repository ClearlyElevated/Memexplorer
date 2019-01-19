const Discord = require("discord.js");
const ms = require("parse-ms"); // eslint-disable-line no-unused-vars
const { loading } = require("../data/emojis.json");
const { invisible } = require("../data/colors.json");
const { logs } = require("../data/channels.json"); // eslint-disable-line no-unused-vars
const { mods } = require("../settings.json");
const replies = require("../data/replies.json");
const prePosts = require("../models/post.js");
const mongoose = require("mongoose");
const mongoUrl = require("../tokens.json").mongodb;

mongoose.connect(mongoUrl, {
  useNewUrlParser: true
});

module.exports = {
  name: "list",
  description: "Posts that need approval",
  cooldown: "5",
  aliases: [],
  async execute (client, message, args) {
    if (!mods.includes(message.author.id)) return message.channel.send("You don't have permission to do that.");
    const msg = await message.channel.send(`${loading} Fetching unapproved posts...`);

    if (!args[0]) {
      prePosts.find({ state: "POST_UNAPPROVED" }).sort([
        ["id", "ascending"]
      ]).exec(async (err, res) => {
        if (err) console.log(err);

        const unapprovedIDs = [];
        
        for (const i of res) {
          unapprovedIDs.push(`${i.id}`);
        }

        const num = await prePosts.countDocuments({ state: "POST_UNAPPROVED"});
        if (num < 1) return msg.edit("No posts pending approval.");
        msg.edit(`
**Unnaproved Posts** (${num.toLocaleString()} posts awaiting approval)
\`\`\`${unapprovedIDs.join(", ")}\`\`\`
`);
      });


    } else if (args[0]) {
      prePosts.findOne({ 
        id: args[0],
        state: "POST_UNAPPROVED"
      }, async (err, post) => {
        if (err) console.log(err);

        if (!post) return msg.edit(replies.noId + ` \`#${args[0]}\`.`);

        const user = await client.fetchUser(post.authorID);
        const t = ms(Date.now() - post.uploadedAt);
        const time = convertTime(t);

        const embed = new Discord.RichEmbed()
          .setTitle("Post awaiting approval")
          .setImage(post.url)
          .setColor(invisible)
          .setFooter(`#${post.id}  Posted by ${user.tag} ${time} ago`, user.displayAvatarURL)
          .setTimestamp();
        return msg.edit(embed);
      });
    }
  },
};

function convertTime (time) {
  let timeInt;
  let timeString;
  if (time.days == 0) {
    if (time.hours == 0) {
      if (time.minutes == 0) {
        timeInt = time.seconds;
        timeString = " second(s)";
      } else {
        timeInt = time.minutes;
        timeString = " minute(s)";
      }
    } else {
      timeInt = time.hours;
      timeString = " hour(s)";
    }
  } else {
    timeInt = time.days;
    timeString = " day(s)";
  }

  const timeVar = timeInt + timeString;
  return timeVar;
}