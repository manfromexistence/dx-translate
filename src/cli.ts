import { intro, outro, select, text, spinner, isCancel } from '@/prompts';
import { MyMemoryTranslator } from '@/translators/mymemory';
import { GoogleTranslator } from '@/translators/google';
import cfonts from "cfonts";

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

  const provider = await select({
    message: 'Which translation provider would you like to use?',
    options: [
      { value: 'MyMemory', label: 'MyMemory' },
      { value: 'Google', label: 'Google' },
    ],
  });

  if (isCancel(provider)) {
    outro('Operation cancelled.');
    return;
  }

  const textToTranslate = await text({
    message: 'Enter the text you want to translate:',
    initialValue: 'Hello, Nice to meet you!',
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

  // Set the default target language based on the selected provider.
  const defaultTargetLang = provider === 'Google' ? 'ar' : 'arabic';

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

    if (provider === 'Google') {
      const googleTranslator = new GoogleTranslator(sourceLang as string, targetLang as string);
      translatedText = await googleTranslator.translate(textToTranslate as string);
    } else {
      const myMemoryTranslator = new MyMemoryTranslator({
        source: sourceLang as string,
        target: targetLang as string,
        email: "ajju40959@gmail.com",
      });
      translatedText = await myMemoryTranslator.translate(textToTranslate as string);
    }
    s.stop('Translation complete!');

    outro(`${translatedText}`);

  } catch (error) {
    s.stop('An error occurred.');
    console.error((error as Error).message);
  }
}

main().catch(console.error);
