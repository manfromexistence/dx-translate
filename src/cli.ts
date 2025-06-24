import inquirer from 'inquirer';
import { GoogleTranslator } from '@/translators/google';
import { MyMemoryTranslator } from '@/translators/mymemory';

/**
 * Main function to run the CLI application.
 */
async function main() {
  console.log('Welcome to the TS-Translator CLI!');

  const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'provider',
      message: 'Which translation provider would you like to use?',
      choices: ['Google', 'MyMemory'],
    },
    {
      type: 'input',
      name: 'text',
      message: 'Enter the text you want to translate:',
      validate: (input) => input.trim() !== '' || 'Please enter some text.',
    },
    {
      type: 'input',
      name: 'targetLang',
      message: 'Enter the target language (e.g., "es", "german"):',
      default: 'en',
    },
    {
        type: 'confirm',
        name: 'useEmail',
        message: 'Do you want to provide an email for a higher MyMemory limit?',
        when: (answers) => answers.provider === 'MyMemory',
    },
    {
        type: 'input',
        name: 'email',
        message: 'Enter your email address:',
        when: (answers) => answers.useEmail,
        validate: (input) => {
            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(input) || 'Please enter a valid email address.';
        }
    }
  ]);

  console.log('\nTranslating...');

  try {
    let translatedText: string;

    if (answers.provider === 'Google') {
      const googleTranslator = new GoogleTranslator('auto', answers.targetLang as 'en');
      translatedText = await googleTranslator.translate(answers.text);
      await googleTranslator.close(); // Important to close the browser
    } else { // MyMemory
      const myMemoryTranslator = new MyMemoryTranslator({
        source: 'auto',
        target: answers.targetLang,
        email: answers.email,
      });
      translatedText = await myMemoryTranslator.translate(answers.text);
    }

    console.log('\n--------------------');
    console.log(`Original Text: ${answers.text}`);
    console.log(`Translation: ${translatedText}`);
    console.log('--------------------\n');

  } catch (error) {
    console.error('\nAn error occurred during translation:');
    console.error(error);
  }
}

main();
