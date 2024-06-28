const db = require('../config/connection');
const { User, Book } = require('../models');
const userSeeds = require('./userSeeds.json');
const BookSeeds = require('./bookSeeds.json');
const cleanDB = require('./cleanDB');

db.once('open', async () => {
  try {
    await cleanDB('Book', 'books');

    await cleanDB('User', 'users');

    await User.create(userSeeds);

    for (let i = 0; i < BookSeeds.length; i++) {
      const { _id, bookAuthor } = await Book.create(BookSeeds[i]);
      const user = await User.findOneAndUpdate(
        { username: bookAuthor },
        {
          $addToSet: {
            books: _id,
          },
        }
      );
    }


  } catch (err) {
    console.error(err);
    process.exit(1);
  }

  console.log('all done!');
  process.exit(0);
});
