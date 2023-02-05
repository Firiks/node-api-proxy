// CLI usage only `node seed-tokens.js`, do not import this file

const Tokens = require('../models/tokens');

const seed = async () => {
  let exit_code = 0;

  try {
    // check if any tokens in db
    const count = await Tokens.countDocuments();
    const tokens = [];

    if(count === 0) {
      console.log("Seeding...");

      tokens.push({
        host: 'example.com',
        token_name: 'X-EXAMPLE_API_KEY',
        token_value: 'some-api-key',
        type: 'header',
        ttl: 600 // 10 min
      });

      await Tokens.insertMany(tokens);
      console.log("tokens seeded successfully");
    } else {
      console.log("Tokens collection is not empty");
    }
  } catch (err) {
    exit_code = 1;
    console.log('Error:', err);
  }

  process.exit(exit_code);
};

seed();