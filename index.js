const Twitch = require("twitch").default;
const ChatClient = require("twitch-chat-client").default;

const { CLIENT_ID, CLIENT_SECRET, TOKEN, USERNAME, GAME_ID } = process.env;

const UPDATE_DELAY = 60000; // milliseconds, 60000 = every minute
const BETTER_RATIO = 1.5; // how much more many viewers a streamer must have to cut currently hosted streamer

const AutoGameHoster =
{
	lastNbHosts: Date.now(),
	hostsLeft: 5,

	currentHost: null,

	async update()
	{		
		if (this.currentHost !== null || this.currentHost.gameId != GAME_ID)
		{
			this.chatClient.unhost(channel.name);
			this.currentHost = null;
		}

		var me = await this.client.helix.streams.getStreamByUserName(USERNAME);
		if (me !== null && me.type != HelixStreamType.None)
			return;
		
		if (this.hostsLeft == 0)
			return;
		
		var streams = await this.client.helix.streams.getStreams({game: GAME_ID});
		streams = await streams.getAll();
		if (streams !== null && streams.length > 0)
		{
			var bestStream = streams[0]; // list is ordered by viewers
			if (bestStream !== this.currentHost && (this.currentHost === null || this.currentHost.viewers * BETTER_RATIO < bestStream.viewers))
			{
				var bestUser = await this.client.helix.users.getUserById(bestStream.userId);
				var channel = await this.client.channels.getChannel(bestUser);
				await this.chatClient.host(channel.name)
					.then(() => {
						this.currentHost = bestStream;
						this.hostsLeft--;
						console.log("hosting: " + bestUser.displayName);
					})
					.catch((e) => {
						console.error("hosting " + bestUser.displayName + " failed: " + e)
					});
			}
		}
	},

	async onHostsRemaining(channel, numberOfHosts)
	{
		if (channel.endsWith(USERNAME))
		{
			console.log(numberOfHosts + " hosts left in the next 30min.");
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
		// to get token, go to: https://id.twitch.tv/oauth2/authorize?client_secret=<secret>&client_id=<client>&redirect_uri=<oauthredirect>&response_type=token&scope=chat:edit+chat:read+channel_editor
		this.client = Twitch.withCredentials(CLIENT_ID, TOKEN);
		this.chatClient = await ChatClient.forTwitchClient(this.client);
		this.chatClient.onHostsRemaining(this.onHostsRemaining);
		this.chatClient.onUnhost(this.onUnhost);
		await this.chatClient.connect();
		await this.chatClient.waitForRegistration();
		await this.chatClient.join(`#${USERNAME}`);
		await this.update();
		setInterval(() => this.update().catch(console.error), UPDATE_DELAY);
	},
};

AutoGameHoster.init().catch(console.error);