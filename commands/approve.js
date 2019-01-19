const { loading, approved } = require("../data/emojis.json");
const { logs } = require("../data/channels.json");
const { mods, prefix } = require("../settings.json");
const replies = require("../data/replies.json");
const postModel = require("../models/post.js");
const profiles = require("../models/profiles.js");
const mongoose = require("mongoose");
const mongoUrl = require("../tokens.json").mongodb;
const db = require("quick.db");

mongoose.connect(mongoUrl, {
  useNewUrlParser: true
});

module.exports = {
  name: "approve",
  description: "Approve a post",
  usage: "<id>",
  cooldown: "5",
  aliases: ["a"],
  args: true,
  async execute (client, message, args) {
    if (!mods.includes(message.author.id)) return message.channel.send("You don't have permission to do that.");
    const msg = await message.channel.send(`${loading} Approving post...`);

    postModel.findOne({
      id: args[0],
      state: "POST_UNAPPROVED"
    }, async (err, post) => {
      if (err) console.log(err);
  
      if (!post) return msg.edit(replies.noId + ` \`#${args[0]}\`.`);

      post.state = "POST_APPROVED";

      await post.save().catch(e => console.log(e));

      client.memes.shift();

      profiles.findOne({
        authorID: post.authorID
      }, async (err, res) => {
        if (err) console.log(err);

        if (!res) {
          const newProfile = new profiles({
            authorID: post.authorID,
            wiiPoints: 0,
            bio: "No bio set",
            totalPosts: 1
          });

          await newProfile.save().catch(e => console.log(e));
        }

        res.totalPosts = res.totalPosts + 1;

        await res.save().catch(e => console.log(e));
      });

      msg.edit(`Successfully approved post with id \`#${post.id}\``);
      const user = await client.fetchUser(post.authorID);
      db.add(`approvedMemes.${message.author.id}`, 1);
      client.channels.get(logs).send(`${approved} **${message.author.tag}** (${message.author.id}) approved a post with id \`#${post.id}\` submitted by **${user.tag}** (${user.id}).`);
      try {
        user.send(`${approved} **${message.author.tag}** has approved your post with id \`#${post.id}\`. You can view your post by doing \`${prefix}meme ${post.id}\`.`);
      } catch (e) {
        console.log(e);
      }
    });
  },
};