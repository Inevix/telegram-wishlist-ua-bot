require('./connect-db')().then(async () => {
    await require('./commands');
    await require('./bot').launch();
});
