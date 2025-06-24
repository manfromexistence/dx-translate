import { intro, outro, select, text, confirm, spinner } from '@clack/prompts';
import { GoogleTranslator } from '@/translators/google';
import { MyMemoryTranslator } from '@/translators/mymemory';
import { isCancel } from '@clack/prompts';
import figlet from 'figlet';
import cfonts from "cfonts";

async function main() {
  console.clear();
  // const title = figlet.textSync('Dx Translate');
  const title:any = cfonts.say('Dx Translate', {
    font: 'block',              // define the font face
    align: 'left',              // define text alignment
    colors: ['system'],         // define all colors
    background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
    letterSpacing: 1,           // define letter spacing
    lineHeight: 1,              // define the line height
    space: true,                // define if the output text should have empty lines on top and on the bottom
    maxLength: '0',             // define how many character can be on one line
    gradient: false,            // define your two gradient colors
    independentGradient: false, // define if you want to recalculate the gradient for each new line
    transitionGradient: false,  // define if this is a transition between colors directly
    rawMode: false,             // define if the line breaks should be CRLF (`\r\n`) over the default LF (`\n`)
    env: 'node'                 // define the environment cfonts is being executed in
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

  const targetLang = await text({
    message: 'Enter the target language (e.g., "es", "german"):',
    initialValue: 'arabic',
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
      const googleTranslator = new GoogleTranslator(sourceLang as string, targetLang as 'en');
      translatedText = await googleTranslator.translate(textToTranslate as string);
      await googleTranslator.close();
    } else {
      const myMemoryTranslator = new MyMemoryTranslator({
        source: sourceLang as string,
        target: targetLang as string,
        email: "ajju40959@gmail.com",
      });
      translatedText = await myMemoryTranslator.translate(textToTranslate as string);
    }
    s.stop('Translation complete!');

    // outro(`Original Text: ${textToTranslate}\nTranslation:    ${translatedText}`);
    outro(`${translatedText}`);

  } catch (error) {
    s.stop('An error occurred.');
    console.error(error);
  }
}

main().catch(console.error);
