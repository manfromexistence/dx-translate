import axios from "axios";
import { BaseTranslator } from "@/translators/base";
import { TranslationNotFoundException } from "@/utils/exceptions";
import { MYMEMORY_LANGUAGES_TO_CODES } from "@/utils/languages";

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
  };
  matches: Array<{ translation: string }>;
}

export interface MyMemoryTranslatorOptions {
    source?: string;
    target?: string;
    email?: string;
}

export class MyMemoryTranslator extends BaseTranslator {
  private static readonly BASE_URL = "http://api.mymemory.translated.net/get";
  private email?: string;

  constructor(options: MyMemoryTranslatorOptions = {}) {
    const { source = "auto", target = "en", email } = options;
    super(source, target, MYMEMORY_LANGUAGES_TO_CODES);
    this.email = email;
  }

  public async translate(text: string): Promise<string> {
    if (this.source === this.target || !text.trim()) {
      return text;
    }

    const params: { q: string; langpair: string; de?: string } = {
      q: text,
      langpair: `${this.source}|${this.target}`,
    };

    if (this.email) {
      params.de = this.email;
    }

    try {
      const response = await axios.get<MyMemoryResponse>(MyMemoryTranslator.BASE_URL, { params });
      const data = response.data;

      if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
      }
      
      if(data.matches && data.matches.length > 0) {
        return data.matches[0].translation;
      }

      throw new TranslationNotFoundException(text);

    } catch (error) {
      console.error("An error occurred during MyMemory translation:", error);
      throw new TranslationNotFoundException(text);
    }
  }
}
