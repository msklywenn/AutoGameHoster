# AutoGameHoster

Automatically hosts on your twitch channel the streamer with the biggest number of views on a specified game


# How to start
First, install all dependencies with NPM.

`$ npm i --production`

Second, set the following environment variables:
 * GAME_ID: the twitch game id you're interested in. (Eg: Pawarumi is 493239, Hearthstone is 138585, etc)
 * CLIENT_ID: ID from an app on the twitch dev dashboard
 * TOKEN: You get it by going to `https://id.twitch.tv/oauth2/authorize?client_secret=SECRET&client_id=CLIENT&redirect_uri=REDIRECT&response_type=token&scope=chat:edit+chat:read+channel_editor`. Replace SECRET with the generated app client secret, CLIENT with the same client app ID and REDIRECT with the OAuth redirect URL set in the twitch dashboard. The token will be in the redirect URL after #access_token=.

Then you just start node on index.js.

Basically:

`$ TOKEN=<token> CLIENT_ID=<client id> GAME_ID=<game id> node index.js`