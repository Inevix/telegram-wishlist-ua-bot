# Wishlist<br/>Лист бажань
Telegram bot<br/>Телеграм бот 
<hr/>

## Prepare to use<br/>Підготуй до використання

There's only one thing that you need in your OS is Docker.<br/>Єдине, що тобі потрібно встановити до ОС - це Docker.

Open the link below and follow instructions:<br/>
Відкрий посилання та слідуй інструкціям:
https://docs.docker.com/get-docker/

## How to run<br/>Як запустити

### Clone current repo<br/>Клонувати поточну репу

Run the command in your terminal.<br/>
Виконай команду в терміналі.

```shell
cd /path/to/directory/with/projects
git clone git@github.com:serhii-chernenko/wishlist.git
cd wishlist
```

### Create your own bot in Telegram<br>Створити власного бота в Телеграмі

Now you have to create a new bot to get an API bot token.<br/>
Зараз тобі потрібно буде створити нового бота, щоб отримати АПІ токен боту.

Open the chat:<br/>
Відкрий чат:<br/>
https://t.me/BotFather

Send the command message to the bot:<br/>
Відправ боту команду:
```shell
/newbot
```

And follow instructions<br/>
Та слідуй інструкціям.

Also, at current step I recommend you to create second bot, 'cause you will have 2 environments:<br/>
Також на цьому етапі я хотів би порадити тобі створити ще одного бота, бо в тебе буде 2 оточення:
   - `dev`
   - `production`

It includes different docker containers and different databases. In this case, better to have 2 different bots with different tokens to run them separately.<br/>
Я маю на увазі різні докер контейнери та бази даних. В цьому випадку краще мати 2-х різних ботів з різними токенами, щоб запускати їх окремо.

### Prepare .env file<br/>Підготуй .env файл

In the new `wishlist` directory you can find the directory `env` with the file `.env.example`.<br/>
В новій директорії `wishlist` ти можеш знайти ще одну директорію `env` з файлом `.env.example`.

First of all copy and rename this file to 2 different files such as: `.env.dev` and `.env.production`.<br/>
Для початку, зроби 2 копії цього файлу та перейменуй його в `.env.dev` та `.env.production`.

```shell
cp env/.env.example env/.env.dev
cp env/.env.example env/.env.production
```

### Set the token<br/>Вказати токен

Open both files and set the tokens as values of the `BOT_TOKEN` variable.<br/>
Відкрий обидва файли та вкажи отримані токени, як значення для змінної `BOT_TOKEN`.

```dotenv
BOT_TOKEN="xxxxx:xxxxx..."
```

Don't forget that better to use different bots with different tokens for `dev` and `production` modes.<br/>
Не забудь, що краще використовувати різних ботів з різними токенами для `dev` та `production` режимів.

### Run docker containers in the developer mode<br/>Запусти докер контейнери в режимі розробника

```shell
npm run docker:dev
```

The command `docker:dev` and other you can find in the `package.json` file.<br/>
Команду `docker:dev` та інші ти можеш знайти у файлі `package.json`. 

### Get and set your Telegram ID<br/>Отримай та вкажи твій Телеграм ID

When the bot is run, try to have chat with it. Send the message:<br/>
Коли бот запущений, спробуй написати йому. Відправ наступне повідомлення:
```shell
/start
```

Go back to the terminal, and you have to see telegram logs. There has to be a JSON object that has to contain sender data. Get your ID from there.<br/>
Повернись до терміналу, зараз ти повинен побачити телеграм логи. Там повинен бути JSON обʼєкт, в якому буде знаходитися інформація по відправнику. Знайти свій ID.
```json
{
  "message": {
      "from": {
          "id": 123456789
      }
  }
}
```

Copy the ID and open both `.env.dev` and `.env.production` files again. Replace the value of the `ADMIN_TELEGRAM_ID` with your real ID.<br/>
Скопіюй ID та відкрий обидва файли знову: `.env.dev` та `.env.production`. Заміни значення змінної `ADMIN_TELEGRAM_ID` на твій реальний ID.
```dotenv
ADMIN_TELEGRAM_ID=123456789
```

There's required to have feedbacks from users to your chat with the bot!<br/>
Це обовʼязково, щоб відгуки від користувачів потряпляли саме до тебе!

After that re-run the bot.<br/>
Після цього перезапусти бота.

Interrupt the process by hotkey `Ctrl/CMD + C` or `Shift + Ctrl/CMD + C` (that depends on terminal preferences).<br/>
Перерви поточний процес за допомогою горячих клавіш `Ctrl/CMD + C` чи `Shift + Ctrl/CMD + C` (це залежить від налаштувань терміналу).

Run the command again:<br/>
Запусти команду знову:
```shell
npm run docker:dev
```

### Run the bot in the production mode<br/>Запусти бота в продакшн режимі

When you run the bot in the developer mode you can't run docker containers in a background, and you see a lot of logs from telegram updates. You can prevent this. Feel free to run the bot in background mode without any logs of telegram updates by the command:<br/>
Коли ти запускаєш бота в режимі розробника, ти не можеш запустити докер контейнери у фоні, а також ти бачиш багато логів після кожного оновлення в чаті з ботом. Ти можеш цьому зарадити. Запустити бота у фоні без логів можна за допомогою команди: 
```shell
npm run docker:start
```

Additional commands:<br/>
Додаткові команди:
```shell
npm run docker:start
npm run docker:stop
npm run docker:restart
```

## Connect to database<br/>Підключитися до бази даних

Make sure that docker containers are active.<br/>
Переконайся, що контейнери запущені.

Run the command to check:<br/>
Введи команду, щоб перевірити:

```shell
docker ps
```

You have to see 2 containers.<br/>
Ти маєш побачити 2 контейнери
1. For the developer mode<br/>Для режиму розробника<br/>`docker:dev`:
   1. `wishlist_db_dev`
   2. `wishlist_app_dev`
2. For the production mode<br/>Для продакшн режиму<br/>`docker:start`:
    1. `wishlist_db_production`
    2. `wishlist_app_production`

You always will have 2 different databases for developer and production mode to not have a bad habit to work with an actual (production) DB in the developer mode.<br/>
Ти завжди будеш мати 2 різні бази даних для режимів розробника та продакшену, щоб не мати поганої звички розробляти на основі реальної бази даних в режимі розробника.

### Via Terminal<br/>В терміналі

Connect to a docker container (depends on chosen mode):<br/>
Підключись до докер контейнеру (залежить від обраного режиму):

```shell
# Developer mode
# Режим розробника
docker exec -ti wishlist_db_dev bash
# Production mode
# Продакшн режим
docker exec -ti wishlist_db_production bash
```

Connect to MongoDB:<br/>
Підключись до MongoDB:
```shell
mongosh
```

Run some commands there:<br/>
Виконай деякі команди:

```shell
# See all databases
# Показати всі бази
show dbs 
# Choose a DB of the developer mode
# Обрати базу даних в режимі розробника
use wishlist_dev
# Choose a DB of the production mode
# Обрати базу даних в продакшн режимі
use wishlist_production
# Show collections
# Показати колекції
show collections
# Show all users
# Показати всіх користувачів
db.users.find()
# Show all wishes and make the output prettier
# Показати всі бажання в зручному для ока форматі
db.wishes.find().pretty()
# Count users
# Порахувати кількість користувачів
db.users.find().count()
```

More commands see there:<br/>
Більше команд дивись тут:
https://www.mongodb.com/docs/manual/reference/method/

To exit from the DB close the terminal tab or run commands below:<br/>
Щоб вийти з бази, закрий термінал чи виконай наступні команди:
```shell
# Exit from the mongosh service
# Вийти з сервісу mongosh
exit
# Exit from the docker container
# Вийти з докер контейнеру
exit
```

### Via GUI tools<br/>В десктопному застосунку

I prefer to use [TablePlus](https://tableplus.com/) but feel free to use any known tools.<br/>
Я переважно використовую [TablePlus](https://tableplus.com/), але ти можеш використовувати будь який відомий тобі застосунок.

1. Create a new connection to MongoDB.<br/>Створи нове зʼєдання до MongoDB. 
2. Use the URL connection:<br/>Використай зʼєднання по URL:
   - mongodb://localhost:27027

### Synchronization<br/>Синхронізація

Files from the docker container of DB will be duplicated on local side. When containers will be run, you will be able to see new directories:<br/>
Файли з докер контейнеру бази даних будуть дубльовані в твоїй системі. Коли контейнери запущені, ти побачиш наступні директорії:
1. `.mongo/dev`<br/>- for a container in developer mode<br/>- для контейнеру в режимі розробника 
2. `.mongo/production`<br/>- for a container in production mode<br/>- для контейнеру в продакшн режимі

### Import/Export DB<br/>Імпорт та експорт бази даних

#### Export database<br/>Експорт бази даних

Disclaimer<br/>Дисклеймер

There will be some examples with a files naming as:<br/>
Далі будуть деякі приклади з найменуванням файлів:
```shell
wishlist_dev_`date "+%Y-%m-%d"`.gz
```

The file will have a name as:<br/>
В результаті отримаємо файл:
```shell
wishlist_dev_2023_01_01.gz
```

Because that's a useful way to give name with a current date. But feel free to replace the name with any other, such as:<br/>
Тому що зручно мати дамп з датою створення у назві. Але ти можеш змінити формат в наступних командах на будь який зручний для тебе, наприклад:
```shell
wishlist.gz
wishlist_dev.gz
wishlist_production.gz
wishlist_dev_2022_12_31.gz
wishlist_production_2022_12_31.gz
```

Developer mode:<br/>
Режим розробника:
```shell
# Create a dump
# Створити дамп
docker exec -ti wishlist_db_dev mongodump -d wishlist_dev --gzip --archive=wishlist_dev_`date "+%Y-%m-%d"`.gz
# Copy the dump from the container to local files
# Скопіювати дамп з контейнеру до системи
docker cp wishlist_db_dev:/wishlist_dev_`date "+%Y-%m-%d"`.gz .backups/wishlist_dev_`date "+%Y-%m-%d"`.gz
# Remove the dump from the container
# Видалити дамп всередині контейнеру
docker exec -ti wishlist_db_dev rm /wishlist_dev_`date "+%Y-%m-%d"`.gz
```

Production mode:<br/>
Продакшн режим:
```shell
# Create a dump
# Створити дамп
docker exec -ti wishlist_db_production mongodump -d wishlist_production --gzip --archive=wishlist_production_`date "+%Y-%m-%d"`.gz
# Copy the dump from the container to local files
# Скопіювати дамп з контейнеру до системи
docker cp wishlist_db_production:/wishlist_production_`date "+%Y-%m-%d"`.gz .backups/wishlist_production_`date "+%Y-%m-%d"`.gz
# Remove the dump from the container
# Видалити дамп всередині контейнеру
docker exec -ti wishlist_db_production rm /wishlist_production_`date "+%Y-%m-%d"`.gz
```

#### Import database<br/>Імпортувати базу даних

Developer mode:<br/>
Режим розробника:
```shell
# Copy a local dump to the container
# Скопіювати локальний дамп в контейнер
docker cp .backups/wishlist_dev_`date "+%Y-%m-%d"`.gz wishlist_db_dev:/wishlist_dev_`date "+%Y-%m-%d"`.gz``
# Import dump
# Імпортувати дамп
docker exec -ti wishlist_db_dev mongorestore -d wishlist_dev --gzip --archive=wishlist_dev_`date "+%Y-%m-%d"`.gz
# Remove the dump from the container
# Видалити дамп всередині контейнеру
docker exec -ti wishlist_db_dev rm /wishlist_dev_`date "+%Y-%m-%d"`.gz
```

Production mode:<br/>
Продакшн режим:
```shell
# Copy a local dump to the container
# Скопіювати локальний дамп в контейнер
docker cp .backups/wishlist_production_`date "+%Y-%m-%d"`.gz wishlist_db_production:/wishlist_production_`date "+%Y-%m-%d"`.gz``
# Import dump
# Імпортувати дамп
docker exec -ti wishlist_db_production mongorestore -d wishlist_production --gzip --archive=wishlist_production_`date "+%Y-%m-%d"`.gz
# Remove the dump from the container
# Видалити дамп всередині контейнеру
docker exec -ti wishlist_db_production rm /wishlist_production_`date "+%Y-%m-%d"`.gz
```

#### Drop database<br/>Видалити базу даних

```shell
# Developer mode
# Режим розробника
docker exec -ti wishlist_db_dev mongosh wishlist_dev --eval "db.dropDatabase()"
# Production mode
# Продакшн режим
docker exec -ti wishlist_db_production mongosh wishlist_production --eval "db.dropDatabase()"
```

## Time to make changes<br/>Час вносити зміни

### Editing<br/>Редагування

Run the bot in the developer mode:<br/>
Запусти бот в режимі розробника:
```shell
npm run docker:dev
```

Next feel free to edit any files in the `bot` directory.<br/>
Далі зміни будь який файл в директорії `bot`.

### Local NPM packages<br/>Локальні NPM пакети

Before go next steps, you have to install NPM packages to your local machine too.<br/>
Перед тим, як рухатися далі, ти маєш встановити NPM пакети локально також.

If you don't have Node.js locally, please visit the [site](https://nodejs.org/en/).<br/>
Якщо в тебе немає Node.js локально, відвідай цей [сайт](https://nodejs.org/uk/).

Next just install NPM packages to the project directory.<br/>
Далі просто встанови NPM пакети в директорію проєкту.
```shell
npm i
```

### Code inspecting<br/>Перевірка коду

There is the `.eslintrc.js` file in the project to present rules for [ESLint](https://eslint.org/).<br/>
В проєкті є `.eslintrc.js` файл з правилами для [ESLint](https://eslint.org/).

Configure your code editor to follow rules:<br/>
Налаштуй свій редактор коду під вказані правила:
   - [VSCode](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   - [PHPStorm](https://www.jetbrains.com/help/phpstorm/eslint.html)

### Code formatting<br/>Форматування коду

There is the `.prettierrc.js` file in the project to preset rules for [Prettier](https://prettier.io/).<br/>
В проєкті є `.prettierrc.js` файл з правилами для [Prettier](https://prettier.io/).

Configure your code editor to follow rules:<br/>
Налаштуй свій редактор коду під вказані правила:
   - [VSCode](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
   - PHPStorm:
     - [Plugin / Плагін](https://plugins.jetbrains.com/plugin/10456-prettier)
     - [Configuration / Налаштування](https://www.jetbrains.com/help/phpstorm/prettier.html)

## Contributing<br/>Долучитися до проєкту

I'm really excited if you are interested in the improving of my project. Thanks so much!<br/>
Я дійсно в захваті, що ти зацікавився покращенням мого проєкту. Дуже тобі вдячний!

There are some steps how you can do that:<br/>
Тут декілька кроків, що потрібно зробини для цього:
1. Fork my repository.<br/>Зроби форк мого репозиторію.
2. Deploy the project locally (follow instructions above).<br/>Розгорни проєкт локально, слідуючи інструкціям вище.
3. Make your changes.<br/>Внеси свої зміни.
4. Make sure that your changes have been self-checked by you.<br/>Обовʼязково перевір свої зміни власноруч.
5. Make sure that you followed rules of ESLint and Prettier. I can't merge your changes if you'll ignore this point.<br/>Переконайся, що в тебе налаштовані ESLint та Prettier. Без них я не прийму твій код.
6. Create a new PR (Pull Request) from your repo to mine.<br/>Зроби новий ПР (запит на внесення коду) з твоєї репи до моєї.
7. Wait while I'll check that.<br/>Очікуй, поки я не перевірю.
8. If I don't agree with your changes, be absolutely sure that I'll write a comment why I think so.<br/>Якщо я не згодний зі змінами, будь певний, я обовʼязково відпишу чому.
9. If I want to see your changes in the project:<br/>Якщо мені подобаються твої зміни:
   - I'll merge the PR if everything is fine.<br/>Я внесу їх, якщо все добре.
   - I'll ask you to do some fixes if something will be wrong.<br/>Я попрошу тебе зробити певні правки, якщо щось буде не так.
