import { LanguageNotSupportedException, TranslationNotFoundException } from "@/utils/exceptions";
import { getLanguageCode } from "@/utils/languages";

export interface TranslatorOptions {
  source?: string;
  target?: string;
}

export abstract class BaseTranslator {
  public source: string;
  public target: string;
  private supportedLanguages: Map<string, string>;

  constructor(source: string, target: string, supportedLanguages: Map<string, string>) {
    this.supportedLanguages = supportedLanguages;
    this.source = this.mapLanguageToCode(source);
    this.target = this.mapLanguageToCode(target);
  }

  private mapLanguageToCode(lang: string): string {
    const code = getLanguageCode(lang, this.supportedLanguages);
    if (!code) {
      throw new LanguageNotSupportedException(lang);
    }
    return code;
  }
  abstract translate(text: string, ...args: any[]): Promise<string>;
}
