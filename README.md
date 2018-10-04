# rally-slack-bot

## Setup Slash Commands 
Currently this bot expects integration via the [Slash Commands](https://parchment.slack.com/apps/A0F82E8CA-slash-commands?next_id=0) app.

Install Slash Commands, add a configuration with the following settings:

| Name | Value |
| --- | --- |
| `Command` | *Up to your, but we chose `/rally`* |
| `URL` | *The url where this bot is accessible* |
| `Method` | `POST` |
| `Token` | *This is generated, you will need to set it in your bot environment variables as `SLACK_TOKEN`* |
| `Customize Name` | *This is up to you, but we chose `rally`*
| `Autocomplete Description` | *Again, whatever you want, but we chose "Get url to search rally story."* |
| `Autocomplete Hint` | *Again, whatever you want, but we chose "[search term or ticket number]"* |


## Setup the bot

```bash
docker run -d -p 8080:8080 -e RALLY_API_KEY=abc123 -e SLACK_TOKEN=def456 mashupmill/rally-slack-bot
```

## Usage

Example commands:

`/rally help`
`/rally US1234`
`/rally foo bar`

