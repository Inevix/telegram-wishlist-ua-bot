require('./connect-db')().then(async () => {
    await require('./bot').launch();
});
