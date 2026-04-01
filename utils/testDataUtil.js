// utils/testDataUtil.js
// Utility for reading test data from JSON and generating random data.

const fs = require('fs');
const path = require('path');
const faker = require('faker');

module.exports = {
  /**
   * Reads test data from a JSON file in test-data folder.
   * @param {string} fileName
   */
  readTestData(fileName) {
    const filePath = path.join(__dirname, '../test-data', fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  },

  /**
   * Generates random user data using faker.
   */
  generateRandomUser() {
    return {
      email: faker.internet.email(),
      password: faker.internet.password(10, true),
      name: faker.name.findName(),
    };
  },
};
