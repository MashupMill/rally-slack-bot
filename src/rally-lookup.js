const rally = require('rally');
const queryUtils = rally.util.query;

const restApi = rally({
    apiKey: process.env.RALLY_API_KEY,
    requestOptions: {
        headers: {
            'X-RallyIntegrationName': require('../package.json').name,
            'X-RallyIntegrationVendor': require('../package.json').author,
            'X-RallyIntegrationVersion': require('../package.json').version
        }
    }
});

module.exports = (req, res) => {
    const { command, text, token } = (req.body || {});

    if (token !== (process.env.SLACK_TOKEN)) {
        return res.status(401).end();
    }

    if (text === 'help') {
        res.json({
            response_type: 'ephemeral',
            text: `How to use ${command}`,
            attachments:[
                {
                    text: `Just type a user story or defect number, like \`${command} US12345\`.`
                }
            ]
        });
    }

    console.log(`Received request for "${text}"`);

    let types = ['defect', 'hierarchicalrequirement', 'testcases', 'tasks', 'feature'];

    if (text.toLowerCase().match(/^de[\d]+$/)) {
        types = ['defect']
    } else if (text.toLowerCase().match(/^us[\d]+$/)) {
        types = ['hierarchicalrequirement']
    } else if (text.toLowerCase().match(/^tc[\d]+$/)) {
        types = ['testcases']
    } else if (text.toLowerCase().match(/^ta[\d]+$/)) {
        types = ['tasks']
    } else if (text.toLowerCase().match(/^f[\d]+$/)) {
        types = ['portfolioitem/feature']
    }

    Promise.all(types.map(type => (
        restApi.query({
            type: type, //text.toLowerCase().startsWith('de') ? 'defect' : 'hierarchicalrequirement',
            start: 1,
            pageSize: 10,
            order: 'Rank',
            fetch: ['FormattedID', 'Name', 'ScheduleState', 'State', 'DisplayColor', 'Owner', 'Project', 'Release'],
            query: queryUtils.where('FormattedID', '=', text)
            .or('Name', 'contains', text)
        })
    ))).then(responses => {
        const results = responses.reduce(((previousValue, currentValue) => (
            previousValue.concat(currentValue.Results)
        )), []);

        if (results.length === 0) {
            return res.json({
                response_type: 'in_channel',
                text: `No results found for "${text}"`
            });
        }

        console.debug(JSON.stringify(results));

        res.json({
            response_type: 'in_channel',
            text: `Results for "${text}"`,
            attachments: results.map(({
                FormattedID,
                Name,
                ScheduleState,
                State,
                DisplayColor,
                Release,
                Owner,
                Project,
            }) => ({
                title: `${FormattedID}: ${Name}`,
                title_link: `https://rally1.rallydev.com/#/search?keywords=${FormattedID}`,
                color: DisplayColor,
                fields: [
                    { title: 'Schedule State', value: ScheduleState && `\`${ScheduleState}\`` || '_Undefined_', short: true },
                    { title: 'State', value: State && `\`${typeof State === 'string' ? State : State._refObjectName}\`` || '_Undefined_', short: true },
                    { title: 'Owner', value: (Owner && Owner._refObjectName || '_Unassigned_'), short: true },
                    { title: 'Project', value: (Project && Project._refObjectName || '_Unassigned_'), short: true },
                    { title: 'Release', value: (Release && Release.Name || null) || '_Unscheduled_', short: true }
                ]
            }))
        });
    }).catch(err => {
        console.error(`Failed while looking up "${text}"`, err);
        res.json({
            text: `Something went wrong while looking up "${text}"\n${JSON.stringify(err)}`
        });

    });


};
