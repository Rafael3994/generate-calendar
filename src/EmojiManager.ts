import emojiRegex from "emoji-regex";
import fs from 'fs';
import path from 'path';

export default class EmojiManager {
    public isEmoji = (char: string): boolean => {
        const regex = emojiRegex();
        return regex.test(char);
    };

    public getEmojisInText = (text: string): string[] => {
        const regex = emojiRegex();
        return text.match(regex) || [];  // Devuelve un array de emojis como strings
    };

    public transformEmojiToHexa = (emoji: string): string => {
        const codePoint = emoji.codePointAt(0);
        return codePoint !== undefined ? codePoint.toString(16) : '';
    };


    public transformEmojisToHexa = (emojis: RegExpMatchArray | null): string[] => {
        if (!emojis || emojis.length === 0) return [];

        const emojiCodes = emojis.map(emoji => {
            const codePoint = emoji.codePointAt(0);
            return codePoint !== undefined ? codePoint.toString(16) : '';
        });

        return emojiCodes || [];
    }

    public getEmojiURL = (emojiHexa: string): string => {
        return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/${emojiHexa}.png`;
    }

    public async loadImageAsBase64(source: string) {
        if (source.startsWith('http') || source.startsWith('https')) {
            return `data:image/png;base64,${await this.loadImageHttpAsBase64(source)}`;
        } else {
            return `data:image/png;base64,${this.loadImageLocalAsBase64(source)}`;
        }
    }

    private async loadImageHttpAsBase64(url: string) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            return Buffer.from(arrayBuffer).toString('base64');
        } catch (error) {
            console.error('Error loading image:', error);
            throw error;
        }
    }

    private loadImageLocalAsBase64(source: string) {
        const imagePath = path.join(__dirname, '..', 'assets', 'emojis', `${source}.png`);
        const imageBuffer = fs.readFileSync(imagePath);
        return imageBuffer.toString('base64');
    }
}