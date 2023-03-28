#!/usr/bin/env node

const axios = require('axios');
const readline = require('readline');
const {
  Configuration,
  OpenAIApi
} = require("openai");

require('dotenv').config();

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Please provide the collection ID as the first argument.');
  process.exit(1);
}

const {
  POSTMAN_API_KEY,
  OPENAI_API_KEY,
  OPENAI_ORGANIZATION_ID
} = process.env;
const MAX_TOKENS = 2000;

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
  organization: OPENAI_ORGANIZATION_ID,
});
const openai = new OpenAIApi(configuration);

const collectionId = args[0];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askUser(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
      rl.close();
    });
  });
}

async function fetchPostmanCollection(collectionId) {
  try {
    const response = await axios.get(`https://api.getpostman.com/collections/${collectionId}`, {
      headers: {
        'X-Api-Key': POSTMAN_API_KEY,
      },
    });

    return response.data.collection;
  } catch (error) {
    throw new Error(error);
  }
}

async function generateDescription(prompt) {
  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt,
    max_tokens: MAX_TOKENS,
  });

  return response.data.choices[0].text;
}

async function updatePostmanCollectionDescription(collectionId, collection) {
  try {
    await axios.put(
      `https://api.getpostman.com/collections/${collectionId}`, {
        collection
      }, {
        headers: {
          'X-API-Key': POSTMAN_API_KEY,
        },
      }
    );
  } catch (error) {
    console.error(error.response.data.error.message);
    console.error(error.response.data.error.details.join(" "))
    throw new Error(error.response.data.error.message);
  }
}

async function main() {
  try {
    const collection = await fetchPostmanCollection(collectionId);
    const collectionName = collection.info.name;

    let requestSummaries = [];
    const numberOfRequests = collection.item.length;
    for (const item of collection.item) {

      const name = item.name;
      const request = item.request;
      const method = request.method;
      const url = request.url.raw;
      let testScript = null;
      let preRequestScript = null;
      if (item.event && item.event.length > 0) {
        for (const event of item.event) {
          if (event.listen === 'test') {
            testScript = event.script.exec.join(' ');
          }
          if (event.listen === 'prerequest') {
            preRequestScript = event.script.exec.join(' ');
          }
        }
      }

      requestSummaries.push(`${method} request to ${url}.  This request is named "${name}".${testScript ? `  It contains the following code it's Postman Test Script, just for context: "${testScript}".` : ``}${preRequestScript ? `  It contains the following code it's Postman Pre-Request Script, just for context: "${preRequestScript}".` : ``}`);
    }

    const joinedRequestSummaries = requestSummaries.join(', ');

    const prompt = `Write a clear and concise paragraph or two of human-readable description summarizing the ${collectionName} Postman Collection, which contains ${numberOfRequests} requests.  Here are some key details about each request: ${joinedRequestSummaries}.  The idea is to create a high level overview of what the collection does.  Do not include the request methods or URLs in the description. Please make sure the description remains within a maximum of ${MAX_TOKENS} OpenAI tokens.  Remember, the goal of the description you are creating is to capture the essence of this Postman Collection.`;

    console.log('=====================================');
    console.log('Generating description...');

    const description = await generateDescription(prompt);

    console.log('=====================================');
    console.log('New description: ', description);
    console.log('=====================================');
    // If a description already exists
    if (collection.info.description) {
      console.log(`A description for the ${collectionName} Postman Collection already exists.`);
      console.log('=====================================');
      console.log('Existing description: ', collection.info.description);
      console.log('=====================================');
      const userResponse = await askUser('Do you want to override the existing description? (Y/N): ');
      if (userResponse.toLowerCase() !== 'y') {
        console.log('No changes were made to the collection description.');
        process.exit(0);
      }
    }
    // Update the collection description in Postman
    console.log('Attempting to update the description in Postman.');
    collection.info.description = description
    await updatePostmanCollectionDescription(collectionId, collection);
    console.log('Collection description updated in Postman.');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

// Example usage:
// node index.js 1234567-6f2s8j4d-s274-xg3s-9u26-1s3hg7ur5d3a