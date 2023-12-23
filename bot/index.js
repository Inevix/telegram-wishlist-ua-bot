const connectDb = require('./connect-db');
const bot = require('./bot');
const User = require('./models/user');
const Wish = require('./models/wish');
const Give = require('./models/give');
const { getTime } = require('./helpers/intl');
const getChanges = require('./i18n/changelog');

async function launchBot() {
    await connectDb();
    console.log(`Bot started ${getTime()}`);

    bot.launch(); // don't add await before. launch() returns promise always in pending

    const changelog = getChanges();
    const latest = Object.keys(changelog)[0];
    const { changes, date } = changelog[latest];
    const message = `*${date}*\n- ${changes?.join('\n - ')}`;
    let users;

    if (!message) {
        return this;
    }

    try {
        users = await User.find({
            version: {
                $ne: latest
            }
        });
    } catch (error) {
        await Promise.reject(error);
    }

    if (!users.length) {
        return this;
    }

    for await (const user of users) {
        if (latest?.toString() === user.version?.toString() && user.noticed) {
            continue;
        }

        if (
            process.env.NODE_ENV === 'dev' &&
            user.telegramId.toString() !==
                process.env.ADMIN_TELEGRAM_ID.toString()
        ) {
            continue;
        }

        try {
            await bot.telegram.sendMessage(user.telegramId, message, {
                parse_mode: 'Markdown'
            });
            await User.findByIdAndUpdate(user._id, {
                version: latest,
                noticed: true
            });
        } catch (exception) {
            if (
                exception?.response?.error_code === 403 &&
                process.env.NODE_ENV === 'production'
            ) {
                try {
                    const id = exception?.on?.payload?.chat_id;

                    if (!id) {
                        continue;
                    }

                    const dbUser = await User.findOne({
                        telegramId: id
                    });

                    if (!dbUser) {
                        continue;
                    }

                    await Give.deleteMany({
                        userId: dbUser._id
                    });
                    await User.findByIdAndRemove(dbUser._id);
                    console.log('User has been deleted', dbUser);

                    continue;
                } catch (e) {
                    console.log('Exception time:', getTime());
                    console.error(e);
                    continue;
                }
            } else if (exception?.response?.error_code === 400) {
                continue;
            }

            console.log('Exception time:', getTime());
            console.error(exception);
        }
    }
}

launchBot();
