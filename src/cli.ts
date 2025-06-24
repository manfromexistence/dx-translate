import { intro, outro, select, text, confirm, spinner } from '@clack/prompts';
import { GoogleTranslator } from '@/translators/google';
import { MyMemoryTranslator } from '@/translators/mymemory';
import { isCancel } from '@clack/prompts';

async function main() {
  console.clear();
  intro(`Dx-Translator CLI`);

  const provider = await select({
    message: 'Which translation provider would you like to use?',
    options: [
      { value: 'Google', label: 'Google' },
      { value: 'MyMemory', label: 'MyMemory' },
    ],
  });
  
  if (isCancel(provider)) {
    outro('Operation cancelled.');
    return;
  }

  const textToTranslate = await text({
    message: 'Enter the text you want to translate:',
    validate: (input) => {
      if (!input) return 'Please enter some text.';
    },
  });
  
  if (isCancel(textToTranslate)) {
    outro('Operation cancelled.');
    return;
  }

  let sourceLang: string | symbol = 'auto';
  if (provider === 'MyMemory') {
    const myMemorySourceLang = await text({
        message: 'Enter the source language (e.g., "en", "english"):',
        initialValue: 'english'
    });
    if (isCancel(myMemorySourceLang)) {
        outro('Operation cancelled.');
        return;
    }
    sourceLang = myMemorySourceLang;
  }

  const targetLang = await text({
    message: 'Enter the target language (e.g., "es", "german"):',
    initialValue: 'bengali',
  });

  if (isCancel(targetLang)) {
    outro('Operation cancelled.');
    return;
  }
  
  let email: string | undefined = undefined;
  if (provider === 'MyMemory') {
      const useEmail = await confirm({
          message: 'Do you want to provide an email for a higher MyMemory limit?'
      });

      if (isCancel(useEmail)) {
        outro('Operation cancelled.');
        return;
      }

      if (useEmail) {
          const emailAddress = await text({
              message: 'Enter your email address:',
              validate: (input) => {
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!emailRegex.test(input)) return 'Please enter a valid email address.';
              }
          });

        if (isCancel(emailAddress)) {
            outro('Operation cancelled.');
            return;
        }
        email = emailAddress as string;
      }
  }

  const s = spinner();
  s.start('Translating...');

  try {
    let translatedText: string;

    if (provider === 'Google') {
      const googleTranslator = new GoogleTranslator(sourceLang as string, targetLang as 'en');
      translatedText = await googleTranslator.translate(textToTranslate as string);
      await googleTranslator.close();
    } else {
      const myMemoryTranslator = new MyMemoryTranslator({
        source: sourceLang as string,
        target: targetLang as string,
        email: email,
      });
      translatedText = await myMemoryTranslator.translate(textToTranslate as string);
    }
    s.stop('Translation complete!');

    outro(`Original Text: ${textToTranslate}\nTranslation:    ${translatedText}`);

  } catch (error) {
    s.stop('An error occurred.');
    console.error(error);
  }
}

main().catch(console.error);
