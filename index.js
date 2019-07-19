String.prototype.format = function()
{
    var that = this;
    for (var arg in arguments)
        that = that.replace("{" + arg + "}", arguments[arg]);
    return that;
}

Array.prototype.random = function()
{
    return this[Math.floor(Math.random() * this.length)];
}

const Twitch = require("twitch").default;
const Discord = require("discord.js");
const ChatClient = require("twitch-chat-client").default;

// environment variables to be set for script to run properly
const {
    CODE, // generate code with authorization code flow
          // see: https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#oauth-authorization-code-flow
          // scope=chat:edit+chat:read+channel_editor
    CLIENT_ID, // client id of twitch app
    CLIENT_SECRET, // client secret of twitch app (for token renewal)
    USERNAME, // twitch username
    GAME, // name of the game to host
    DISCORD, // discord app token
    DISCORD_CHANNEL // discord channel ID to put messages on
} = process.env;

const UPDATE_DELAY = 60000; // milliseconds, 60000 = every minute
const BETTER_RATIO = 1.5; // how much more many viewers a streamer must have to cut currently hosted streamer

// {0} = streamer name
// {1} = streamer url
// {2} = game name
const HostMessages = [
    "{0} is streaming {2} and we're hosting him/her! {1}",
    "We're now hosting {0}! {1}",
    "So cool that {0} is streaming {2}! Hosted! {1}"
    ];

const StreamMessages = [
    "Hey, cool, {0} is streaming {2} at {1}",
    "Nice! {0} started streaming {2} <3 {1}",
    "Go watch {0}, (s)he's streaming {2}! {1}"
    ];

const AutoGameHoster =
{
	lastNbHosts: Date.now(),
	hostsLeft: 5,

	currentHost: null,
        knownStreams: [],

	async update()
	{
            // reconnect if necessary
            if (this.token.isExpired)
            {
                this.token = await Twitch.refreshAccessToken(CLIENT_ID, CLIENT_SECRET, token.refreshToken);
                await connect();
            }

                // check current host is still playing our target game
		if (this.currentHost !== null && this.currentHost.gameId != this.game.id)
		{
			this.chatClient.unhost(channel.name);
			this.currentHost = null;
		}

                // check our channel isn't streaming
		var me = await this.client.helix.streams.getStreamByUserName(USERNAME);
		if (me !== null && me.type != HelixStreamType.None)
			return;
		
                // find the streamer with most views on target game
		var streams = await this.client.helix.streams.getStreams({game: this.game.id});
		streams = await streams.getAll();
		if (streams !== null && streams.length > 0)
		{
			var bestStream = streams[0]; // list is ordered by viewers so first is best

                        // check that we are allowed to host anyone
			if (this.hostsLeft > 0 && bestStream !== this.currentHost
                                && (this.currentHost === null || this.currentHost.viewers * BETTER_RATIO < bestStream.viewers))
			{
				var bestUser = await this.client.helix.users.getUserById(bestStream.userId);
				var channel = await this.client.channels.getChannel(bestUser);
				await this.chatClient.host(channel.name)
					.then(() => {
						this.currentHost = bestStream;
						this.hostsLeft--;
                                                if (this.discordChannel != null)
                                                    this.discordChannel.send(
                                                        HostMessages.random().format(bestUser.displayName, channel.url, GAME));
					})
					.catch((e) => {
						console.error("hosting " + bestUser.displayName + " failed: " + e)
					});
			}
                        else
                        {
                            bestStream = null;
                        }

                        streams.forEach(stream => {
                            if (!this.knownStreams.includes(stream))
                            {
                                if (stream != bestStream)
                                    this.discordChannel.send(StreamMessages.random().format(bestUser.displayName, channel.url, GAME));
                                array_push(this.knownStreams, stream);
                            }
                        });
                        this.knownStreams = this.knownStreams.filter(stream => streams.includes(stream));
		}
                else
                {
                    this.knownStreams = [];
                }
	},

	async onHostsRemaining(channel, numberOfHosts)
	{
		if (channel.endsWith(USERNAME))
		{
			console.log(numberOfHosts + " host(s) left in the next 30min.");
			this.lastNbHosts = Date.now();
			this.hostsLeft = numberOfHosts;
		}
	},
	
	async onUnhost(channel)
	{
		if (channel.endsWith(USERNAME))
		{
			console.log("external unhost!");
			this.currentHost = null;
		}		
	},

	async init()
	{
	        this.token = await Twitch.getAccessToken(CLIENT_ID, CLIENT_SECRET, CODE, "http://localhost");
                await this.connect();
                this.discord = new Discord.Client();
                var that = this;
                this.discord.on("ready", () => { that.discordChannel = that.discord.channels.get(DISCORD_CHANNEL);});
                this.discord.login(DISCORD);
		setInterval(() => this.update().catch(console.error), UPDATE_DELAY);
	},

        async connect()
        {
                this.client = await Twitch.withCredentials(CLIENT_ID, this.token.accessToken);
                this.game = await this.client.helix.games.getGameByName(GAME);
                if (this.game != null)
                {
                    this.chatClient = await ChatClient.forTwitchClient(this.client);
                    this.chatClient.onHostsRemaining(this.onHostsRemaining);
                    this.chatClient.onUnhost(this.onUnhost);
                    await this.chatClient.connect();
                    await this.chatClient.waitForRegistration();
                    await this.chatClient.join(`#${USERNAME}`);
                    await this.update();
                }
        }
};

AutoGameHoster.init().catch(console.error);
