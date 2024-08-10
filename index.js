require('dotenv').config() //

const { Bot, GrammyError, HttpError, Keyboard, InputFile} = require('grammy')
const fs = require('fs')
const bot = new Bot(process.env.BOT_API_KEY)
const { updateUserData, isAdmin} = require('./index1')
// Меню Bot
const userDataFile = 'userData.json';

// Проверяем существование файла userData.json и создаем его, если он не существует
if (!fs.existsSync(userDataFile)) {
  fs.writeFileSync(userDataFile, '{}')
}

let userData = JSON.parse(fs.readFileSync(userDataFile))

bot.command('start', async (ctx) => {
    if (!userData[ctx.from.id]) {
        // Обновляем данные о пользователе при первом запуске
        updateUserData(userDataFile, ctx.from.id);
      }
        const capthaKeyboard = new Keyboard().text('Я ЧЕЛОВЕК!')
                await ctx.reply('подтвердите, что вы не робот 🤖,' + ctx.msg.from.first_name , {
                reply_markup: capthaKeyboard
        })
})


// Обработка команды администратора
bot.command('admin', async (ctx) => {
    // Проверяем, является ли пользователь администратором
    if (isAdmin(ctx.from.id, process.env.ADMIN_ID)) {
      // Если пользователь администратор, отправляем статистику использования бота
      let totalStarts = 0;
      for (const userId in userData) {
        totalStarts += userData[userId].timesStarted;
      }
      await ctx.reply(`Статистика использования бота:\nВсего запусков: ${totalStarts}`);
    } else {
      await ctx.reply('У вас нет прав администратора!');
    }
  });
 // Реакция на нажатие кнопким
let arrText = ['✅Включить рекламу','🚫Отключить рекламу']

bot.hears('Я ЧЕЛОВЕК!', async (ctx) => {
        const met = new Keyboard().text('📨Связь с админом').text('🎲Бросить кубик').text(arrText[0])
    // Проверка на наличии такого же Узернайма

        await ctx.reply('Спасибо за ответ! Ваша заявка будет одобрена модераторами в ближайшее время.  👍',
            {
                reply_markup:met
            }
        )
})


// Меню
bot.hears('📨Связь с админом', async (ctx) => {
    await ctx.reply('Отправьте текст сообщения:')
})
bot.on('message', async (ctx) => {
    const authorId = process.env.ADMIN_ID;
    
   
      // Пересылаем сообщение от пользователя автору бота
      if (ctx.message.text) {
        await ctx.forwardMessage(authorId, { text: ctx.message.text });
      } else if (ctx.message.voice) {
        await ctx.forwardMessage(authorId, { voice: ctx.message.voice });
      } else if (ctx.message.photo) {
        await ctx.forwardMessage(authorId, { photo: ctx.message.photo });
      } else if (ctx.message.video) {
        await ctx.forwardMessage(authorId, { video: ctx.message.video });
      } else {
        await ctx.forwardMessage(authorId, ctx.message);
      }    
      await ctx.reply('Ваше сообщение успешно отправлено администрации');
  
  });

let arrContenet = []
let variant = [':text','::email', ':photo', ':video', '::text_link', '::custom_emoji', ':sticker']
//Контент на кнопка Добавить контент

// Функция рандома выпадения кубика
let arrEmodge = ['c1.tgs','c2.tgs','c3.tgs','c4.tgs','c5.tgs','c6.tgs']
const tan = () => {
    let res = 0 
    for (let i = 0; i < arrEmodge.length; i++) {
         res = Math.ceil(Math.floor(Math.random(arrEmodge[i]) * 12)/ 2)
    }
    return res
} 
bot.hears('🎲Бросить кубик', async (ctx) => {
         if (ctx.msg.text == '🎲Бросить кубик') {
            //const imageStream = fs.createReadStream('./suc.jpg')
            await ctx.api.sendAnimation(ctx.msg.chat.id, new InputFile(arrEmodge[tan()]), {
                caption: arrEmodge
            })
         }
})
bot.hears('✅Включить рекламу', async (ctx) => {
    const mets = new Keyboard().text('📨Связь с админом').text('🎲Бросить кубик').text(arrText[1])
        await ctx.reply('Реклама включена',
            {
                reply_markup:mets
            }
        )
})
bot.hears('🚫Отключить рекламу', async (ctx) => {
    const mets = new Keyboard().text('📨Связь с админом').text('🎲Бросить кубик').text(arrText[0])
        await ctx.reply('Реклама отключена',
            {
                reply_markup:mets
            }
        )
})
// Оборочиваем TryCath
bot.catch((err)=>{
    const ctx = err.ctx
    console.log(`Error while handling update ${ctx.update.update_id}:`)
    const e = err.error

    if (e instanceof GrammyError) {
        console.error('Error in request', e.description)
    } else
    if (e instanceof HttpError) {
        console.error('Could not contact Telegram:', e)
    }
    else 
    {
        console.error('Unknown error:', e)
    }
})

bot.start()
