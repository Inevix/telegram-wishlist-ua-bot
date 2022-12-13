const resetTimer = async ctx => {
    if (!ctx.scene.session?.timer) return this;

    clearTimeout(ctx.scene.session.timer);
};

const setTimer = async (ctx, scene, delay = 2000) => {
    await resetTimer(ctx);

    ctx.scene.session.timer = setTimeout(async () => {
        await ctx.scene.enter(scene);
    }, delay);

    return ctx.scene.session.timer;
};

module.exports = {
    resetTimer,
    setTimer
};
