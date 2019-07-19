# AutoGameHoster

Automatically hosts on your twitch channel the streamer with the biggest number of views on a specified game.
Also sends a message on a specific channel on discord.

It will also send a message if someone starts streaming the game, even if it's not hosted on your channel.


# How to start
First, install all dependencies with NPM.

`$ npm i --production`

Second, set the following environment variables:
 * USERNAME: your twitch username
 * GAME: the twitch game
 * CLIENT_ID: ID from an app on the twitch dev dashboard
 * CLIENT_SECRET: secret from the app on twitch dev dashboard (for token renewal)
 * CODE: Follow the Twitch OAuth Authorization Code Flow to generate it
 * DISCORD: token of the discord app you created
 * DISCORD_CHANNEL: discord channel ID (not name, enable dev mode in appearance to get it) to send messages to

Then you just start node on index.js.

Basically:

`$ CODE=<token> CLIENT_ID=<client id> CLIENT_SECRET=<secret> GAME=<game name> USERNAME=<username> DISCORD=<token> DISCORD_CHANNEL=<id> node index.js`
