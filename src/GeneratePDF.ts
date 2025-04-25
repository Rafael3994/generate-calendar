import jsPDF from "jspdf";
import Calendar from "./Calendar.ts";
import EmojiManager from "./EmojiManager.ts";
import GraphemeSplitter from "grapheme-splitter";

export class GeneratePDF {
    private calendar: Calendar;
    private emojiManage: EmojiManager;
    private doc: jsPDF;
    private graphemeSplitter: GraphemeSplitter;

    private pageWidth: number;
    private cellWidthTable: number;
    private cellHeightTable: number;
    private calendarWidth: number;
    private marginLeftTable: number;
    private marginTopTable: number;
    private radio: number;
    private fontsize: number;

    constructor(calendar: Calendar) {
        this.calendar = calendar;
        this.emojiManage = new EmojiManager();
        this.doc = new jsPDF({ orientation: "landscape" });
        this.graphemeSplitter = new GraphemeSplitter();
        this.pageWidth = this.doc.internal.pageSize.width;
        this.cellWidthTable = 36;
        this.cellHeightTable = 30;
        this.calendarWidth = this.cellWidthTable * 7;
        this.marginLeftTable = (this.pageWidth - this.calendarWidth) / 2;
        this.marginTopTable = 18;
        this.radio = 3.3;
        this.fontsize = 12;
    }

    public async drawCalendarYear(): Promise<void> {
        for (let index = 1; index <= 12; index++) {
            await this.drawCalendar(index);
            if (index !== 12) this.doc.addPage('a4', 'landscape');
        }
    }

    public getBuffer(): ArrayBuffer {
        return this.doc.output("arraybuffer");
    }

    public async drawCalendar(numberMonth: number): Promise<void> {
        const monthName = this.calendar.getMonthName(numberMonth);
        const year = this.calendar.getYear();
        const days = this.calendar.getDaysInMonth(numberMonth);

        await this.drawTitle(monthName, year);
        await this.drawTableHeader();
        await this.drawTableBody(days, numberMonth);
    }

    private async drawTitle(monthName: string, year: number) {
        const title = `${monthName} ${year}`;
        const textWidth = this.doc.getTextWidth(title);

        const xOffset = (this.pageWidth / 2) - textWidth;

        this.doc.setFont("courier", "bold");
        this.doc.setFontSize(25);
        await this.printText(title, xOffset, 12);
    }

    private async drawTableHeader(): Promise<void> {
        this.doc.setFontSize(13);
        const weekDays = this.calendar.getWeekDays();
        for (let i = 0; i < weekDays.length; i++) {
            const xOffset = this.marginLeftTable + i * this.cellWidthTable;
            const yOffset = this.marginTopTable;

            this.doc.setDrawColor(128, 128, 128);

            const widthDay = this.doc.getTextWidth(weekDays[i]);
            await this.printText(weekDays[i], xOffset + (this.cellWidthTable - widthDay) / 2, yOffset + 5.7)
            this.printBorder(xOffset, yOffset, this.cellWidthTable, 9);
        }

    }

    private async drawTableBody(days: (number | null)[], numberMonth: number): Promise<void> {
        let xOffset = this.marginLeftTable;
        let yOffset = this.marginTopTable + 9;
        this.doc.setFont("helvetica", "normal");

        for (let i = 0; i < days.length; i++) {
            const day = days[i];

            if (i > 0 && i % 7 === 0) {
                xOffset = this.marginLeftTable;
                yOffset += this.cellHeightTable;
            }


            this.printBorder(xOffset, yOffset, this.cellWidthTable, this.cellHeightTable);
            if (day !== null) {
                if (day >= 20) {
                    await this.printText(String(day), xOffset + this.cellWidthTable - 6.2, yOffset + 5.4);
                } else if (day >= 10 && day < 20) {
                    await this.printText(String(day), xOffset + this.cellWidthTable - 6.4, yOffset + 5.4);
                } else {
                    await this.printText(String(day), xOffset + this.cellWidthTable - 5.15, yOffset + 5.4);
                }

                for (const item of this.calendar.getEvent()) {
                    const parsed = this.calendar.parseEvent(item);
                    if (parsed) {
                        const { dayEvent, monthEvent, nameEvent } = parsed;
                        if (+dayEvent === day && +monthEvent === numberMonth) {
                            await this.printEvent(xOffset, yOffset, nameEvent);
                        }
                    }
                }
            }
            xOffset += this.cellWidthTable;
        }
    }

    private async printEvent(xOffset: number, yOffset: number, nameEvent: string = this.calendar.getTextEvent()) {
        nameEvent = await this.truncateTextToFit(nameEvent, this.cellWidthTable - 5, this.cellHeightTable + 5, this.doc.getLineHeightFactor() + 3.5);
        this.doc.setFontSize(10);
        await this.printText(nameEvent, xOffset + 1.5, yOffset + 4);
        this.printCircle(xOffset + this.cellWidthTable - 4, yOffset + 4, this.radio);
    }

    private async truncateTextToFit(
        text: string,
        maxWidth: number,
        maxHeight: number,
        lineHeight: number
    ): Promise<string> {
        const phrases = text.split("#");
        const allLines: string[] = [];
        let totalHeight = 0;

        for (let i = 0; i < phrases.length; i++) {
            const words = phrases[i].split(" ");
            const lines: string[] = [];
            let currentLine = "";

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = this.doc.getTextWidth(testLine);

                if (testWidth > maxWidth) {
                    const wordWidth = this.doc.getTextWidth(word);

                    if (wordWidth > maxWidth) {
                        currentLine = this.splitWordAndAddToLines(word, lines, lineHeight, maxWidth, maxHeight, totalHeight);
                    } else {
                        if (currentLine) lines.push(currentLine);
                        totalHeight += lineHeight;

                        if (totalHeight + lineHeight > maxHeight) {
                            const lastLine = lines.pop() ?? "";
                            allLines.push([...lines, `${lastLine}...`].join("\n"));
                            return allLines.join("\n");
                        }

                        currentLine = word;
                    }
                } else {
                    currentLine = testLine;
                }
            }

            if (currentLine) lines.push(currentLine);
            totalHeight += lineHeight;

            if (totalHeight + lineHeight > maxHeight) {
                const lastLine = lines.pop() ?? "";
                allLines.push([...lines, `${lastLine}...`].join("\n"));
                return allLines.join("\n");
            }

            allLines.push(lines.join("\n"));

            if (i < phrases.length - 1) {
                allLines.push("");
                totalHeight += lineHeight;
            }
        }

        return allLines.join("\n");
    }




    private truncateText(lines: string[], totalHeight: number, maxHeight: number) {
        if (totalHeight > maxHeight) {
            return lines.join("\n") + "...";
        }
    }

    private splitWordAndAddToLines(word: string, lines: string[], lineHeight: number, maxWidth: number, maxHeight: number, totalHeight: number): string {
        let splitWord = "";
        for (const char of word) {
            if (this.doc.getTextWidth(splitWord + char) <= maxWidth) {
                splitWord += char;
            } else {
                splitWord += "-";
                lines.push(splitWord);
                totalHeight += lineHeight;

                if (totalHeight + lineHeight > maxHeight) {
                    lines.push("...");
                    return "";
                }
                splitWord = char;
            }
        }
        return splitWord;
    }

    private async printText(text: string, xOffset: number, yOffset: number): Promise<void> {
        const lines = text.split('\n');
        const lineHeight = this.doc.getLineHeightFactor() + 2.9;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let currentX = xOffset;
            const currentY = yOffset + i * lineHeight;

            const graphemes = this.graphemeSplitter.splitGraphemes(line);

            for (const part of graphemes) {
                if (this.emojiManage.isEmoji(part)) {
                    const emojiHex = this.emojiManage.transformEmojiToHexa(part);
                    const emojiUrl = this.emojiManage.getEmojiURL(emojiHex);
                    const base64Image = await this.emojiManage.loadImageAsBase64(emojiUrl);
                    this.doc.addImage(base64Image, 'PNG', currentX, currentY - 3, 3.5, 3.5);
                    currentX += 3.5;
                } else {
                    this.doc.text(part, currentX, currentY);
                    currentX += this.doc.getTextWidth(part);
                }
            }
        }
        this.doc.setFontSize(this.fontsize);
    }

    private printBorder(xOffset: number, yOffset: number, width: number, height: number): void {
        this.doc.rect(xOffset, yOffset, width, height);
    }

    private printCircle(xOffset: number, yOffset: number, radio: number): void {
        this.doc.circle(xOffset, yOffset, radio, 'S');
    }

    public save(filename: string): void {
        this.doc.save(filename);
    }
}
