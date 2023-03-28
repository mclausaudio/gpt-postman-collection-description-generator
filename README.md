# GPT Postman Collection Description Generator
- By Michael J. Claus

This script generates and updates a human-readable description for a Postman Collection using the OpenAI API, based on the collection ID provided as a command-line argument.

## Example

### Demo #1


## Prerequisites

- Node.js installed on your system
- Postman API Key
- OpenAI API Key and Organization ID

## Installation

1. Clone the repository:

\`\`\`
git clone https://github.com/your-username/postman-collection-description-generator.git
\`\`\`

2. Navigate to the project directory:

\`\`\`
cd postman-collection-description-generator
\`\`\`

3. Install the required dependencies:

\`\`\`
npm install
\`\`\`

4. Create a `.env` file in the root directory of the project and add your Postman API Key, OpenAI API Key, and OpenAI Organization ID:

\`\`\`
POSTMAN_API_KEY=your_postman_api_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_ORGANIZATION_ID=your_openai_organization_id
\`\`\`

## Usage

Run the script with the collection ID as the first argument:

\`\`\`
node main.js <collection_id>
\`\`\`

Example:

\`\`\`
node main.js 1081313-c3297b5a-b24e-405b-830e-005d457aa738
\`\`\`

The script will generate a new description for the specified Postman Collection and ask you whether you want to update the existing description in Postman or not. Type \`Y\` to update the description or \`N\` to exit without updating.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
