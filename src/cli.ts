import { intro, outro, select, text, spinner, isCancel } from '@/prompts';
import { MyMemoryTranslator } from '@/translators/mymemory';
// import { GoogleTranslator } from '@/translators/google';
import cfonts from "cfonts";
import fs from 'fs/promises';
import path from 'path';

async function runTryMode() {
  const textToTranslate = await text({
    message: 'Enter the text you want to translate:',
    initialValue: `A greeting is far more than a simple formality; it is the spark that ignites human connection.`,
    validate: (input) => {
      if (!input) return 'Please enter some text.';
    },
  });

  if (isCancel(textToTranslate)) {
    outro('Operation cancelled.');
    return;
  }

  const sourceLang = 'english';
  /*
  const myMemorySourceLang = await text({
    message: 'Enter the source language (e.g., "en", "english"):',
    initialValue: 'english'
  });
  if (isCancel(myMemorySourceLang)) {
    outro('Operation cancelled.');
    return;
  }
  sourceLang = myMemorySourceLang;
  */

  const defaultTargetLang = 'arabic';

  const targetLang = await text({
    message: 'Enter the target language (e.g., "es", "german"):',
    initialValue: defaultTargetLang,
  });


  if (isCancel(targetLang)) {
    outro('Operation cancelled.');
    return;
  }

  const s = spinner();
  s.start('Translating...');

  try {
    let translatedText: string;

    const myMemoryTranslator = new MyMemoryTranslator({
      source: sourceLang as string,
      target: targetLang as string,
      email: "ajju40959@gmail.com",
    });
    translatedText = await myMemoryTranslator.translate(textToTranslate as string);
    
    s.stop('Translation complete!');

    outro(`${translatedText}`);

  } catch (error) {
    s.stop('An error occurred.');
    console.error((error as Error).message);
  }
}

async function runGenerateMode() {
  const filePathInput = await text({
      message: 'Enter the path to the source JSON file:',
      initialValue: './locales/en.json',
  });

  if (isCancel(filePathInput)) {
      outro('Operation cancelled.');
      return;
  }

  const s = spinner();
  s.start(`Reading file: ${filePathInput}`);

  try {
      const absolutePath = path.resolve(process.cwd(), filePathInput as string);
      const fileContent = await fs.readFile(absolutePath, 'utf-8');
      const jsonContent = JSON.parse(fileContent);

      s.stop('File read successfully.');
      
      console.log('\n--- Keys and Values from File ---');
      for (const key in jsonContent) {
          if (Object.prototype.hasOwnProperty.call(jsonContent, key)) {
              console.log(`  ${key}: ${jsonContent[key]}`);
          }
      }
      console.log('---------------------------------\n');

      outro('File processing complete.');

  } catch (error) {
      s.stop('An error occurred.');
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
          console.error('Error: File not found at the specified path.');
      } else if (error instanceof SyntaxError) {
          console.error('Error: Failed to parse JSON. Please check the file format.');
      } else {
          console.error((error as Error).message);
      }
  }
}


async function main() {
  console.clear();

  const title: any = cfonts.say('Dx Translate', {
    font: 'block',
    align: 'left',
    background: 'transparent',
    letterSpacing: 1,
    lineHeight: 1,
    space: true,
    maxLength: '0',
    gradient: ['cyan', 'blue'],
    independentGradient: true,
    transitionGradient: false,
    env: 'node'
  });

  intro(title);

  const mode = await select({
      message: 'What would you like to do?',
      options: [
          { value: 'Generate', label: 'Generate from a file' },
          { value: 'Try', label: 'Try a single translation' },
      ],
  });

  if (isCancel(mode)) {
      outro('Operation cancelled.');
      return;
  }

  if (mode === 'Generate') {
      await runGenerateMode();
  } else if (mode === 'Try') {
      await runTryMode();
  }
}

main().catch(console.error);