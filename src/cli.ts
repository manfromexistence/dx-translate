import { intro, outro, select, text, spinner, isCancel } from '@/prompts';
import { MyMemoryTranslator } from '@/translators/mymemory';
// import { GoogleTranslator } from '@/translators/google';
import { MYMEMORY_LANGUAGES_TO_CODES } from "@/utils/languages";
import cfonts from "cfonts";
import fs from 'fs/promises';
import path from 'path';

async function runTryMode() {
  const textToTranslate = await text({
    message: 'Enter the text you want to translate:',
    initialValue: `(Hello World)`,
    validate: (input) => {
      if (!input) return 'Please enter some text.';
    },
  });

  if (isCancel(textToTranslate)) {
    outro('Operation cancelled.');
    return;
  }

  const sourceLang = 'english';
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
    const myMemoryTranslator = new MyMemoryTranslator({
      source: sourceLang as string,
      target: targetLang as string,
      email: "manfromexistence1@gmail.com",
    });
    const translatedText = await myMemoryTranslator.translate(textToTranslate as string);

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
    initialValue: './locales/english.json',
  });

  if (isCancel(filePathInput)) {
    outro('Operation cancelled.');
    return;
  }
  
  const s = spinner();
  
  try {
    s.start(`Reading source file: ${filePathInput}`);
    const absolutePath = path.resolve(process.cwd(), filePathInput as string);
    const fileContent = await fs.readFile(absolutePath, 'utf-8');
    const jsonContent = JSON.parse(fileContent);
    
    s.stop('File read successfully.');

    // Removed the language input prompt. We will now always translate to all languages.
    const targetLanguages: string[] = Array.from(MYMEMORY_LANGUAGES_TO_CODES.keys());
    
    const originalKeys = Object.keys(jsonContent);
    const originalValues = Object.values(jsonContent);
    const textToTranslate = originalValues.map(value => `(${value})`).join('');
    const totalLanguages = targetLanguages.length;

    s.start(`Preparing to translate into ${totalLanguages} languages.`);
    
    // Iterate over each selected language and perform translation
    for (let i = 0; i < totalLanguages; i++) {
        const langName = targetLanguages[i];
        const langCode = MYMEMORY_LANGUAGES_TO_CODES.get(langName)!;

        // Update spinner to show current progress
        s.message(`Translating to ${langName} (${i + 1} of ${totalLanguages})...`);

        try {
            const translator = new MyMemoryTranslator({
                source: 'english',
                target: langCode,
                email: 'manfromexistence1@gmail.com', // Using an email is recommended
            });

            const translatedText = await translator.translate(textToTranslate);
            
            // Use regex to extract translated values from the response string
            const translatedValues = translatedText.match(/\((.*?)\)/g)?.map(v => v.slice(1, -1)) || [];
            
            if (originalKeys.length !== translatedValues.length) {
                console.warn(`\n[Warning] Mismatch for ${langName}. Expected ${originalKeys.length} translations, but got ${translatedValues.length}. Skipping.`);
                continue; // Skip this language and proceed with the next one
            }

            const newJsonContent = Object.fromEntries(
                originalKeys.map((key, index) => [key, translatedValues[index]])
            );

            const localesDir = path.resolve(process.cwd(), 'locales');
            const targetFilePath = path.join(localesDir, `${langName.replace(/\s/g, '-')}.json`);
            
            await fs.mkdir(localesDir, { recursive: true });

            let finalJsonToWrite = newJsonContent;

            // Check if a file for the language already exists to update it
            try {
                const existingContent = await fs.readFile(targetFilePath, 'utf-8');
                const existingJson = JSON.parse(existingContent);
                finalJsonToWrite = { ...existingJson, ...newJsonContent };
            } catch (err) {
                // If the file doesn't exist or is unreadable, a new one will be created.
            }
            
            await fs.writeFile(targetFilePath, JSON.stringify(finalJsonToWrite, null, 2), 'utf-8');

        } catch (langError) {
            console.error(`\n[Error] Failed to process language "${langName}": ${(langError as Error).message}`);
        }
    }

    s.stop(`Translation process completed. Processed ${totalLanguages} languages.`);
    outro('All files have been generated/updated in the /locales directory.');

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

  cfonts.say('Dx Translate', {
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

  intro('Welcome to the Translation CLI');

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