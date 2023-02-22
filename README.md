# Metrics DAO Discord Bot
This is the code for the Metrics DAO's Golden Ticket Discord Bot.

## Before you start
1. Setup a Discord Bot (https://www.upwork.com/resources/how-to-make-discord-bot)
2. Get its token, you'll need this later.
3. Invite this bot to your server.
4. Permission integer = 68672.

## How to run locally
1. Clone this repo.
2. Install `typescript` if you haven't.
3. Copy .env.example and rename it to .env.
4. Fill up .env

```
DISCORD_BOT_TOKEN= The token obtained in "Before you start's Step 2"
DISCORD_BOT_CLIENT_ID= It's the Application ID under the bot's General Information tab
DISCORD_GUILD_ID= Metrics DAO's ID (902943676685230100)

BACKEND_BASE_URL=http://localhost:8081
```

5. Run `npm install`.
6. Run `npm run deploy`.
7. Run `npm restart`.

## How to deploy
1. Setup a Linux server with supervisord installed.
2. Do Steps 1 to 6 in How to run locally. `BACKEND_BASE_URL=http://localhost:8081` if the server is ran in the same server as this bot.
3. Setup supervisord

Sample ini file

```
[program:metrics_dao_discord_bot]
directory=/var/www/html/discord_bot
command=node --experimental-modules index.js
process_name=%(program_name)s_%(process_num)02d
numprocs=1
priority=999
autostart=true
autorestart=true
startsecs=1
startretries=3
user=apache
stdout_logfile=/var/log/mbot.log
stderr_logfile=/var/log/mbot_error.log
redirect_stderr=true
```

4. Run supervisord
5. You might want to make several slash commands to be visible only to the admins. Namely: 

```
/add_admin
/remove_admin
/add_ticket
/pending_approvals
```