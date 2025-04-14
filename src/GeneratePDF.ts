import jsPDF from "jspdf";
import Calendar from "./Calendar.ts";
import EmojiManager from "./EmojiManager.ts";
import fs from 'fs';
import path from 'path';

export class GeneratePDF {
    private calendar: Calendar;
    private emojiManage: EmojiManager;
    private doc: jsPDF;

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
        // for (let index = 1; index <= 12; index++) {
        //     this.drawCalendar(index);
        //     if (index !== 12) this.doc.addPage('a4', 'landscape');
        // }
        await this.drawCalendar(1);
        this.doc.addPage('a4', 'landscape');
    }

    public getBuffer(): ArrayBuffer {
        return this.doc.output("arraybuffer");
    }

    public async drawCalendar(numberMonth: number): Promise<void> {
        const monthName = this.calendar.getMonthName(numberMonth);
        const year = this.calendar.getYear();
        const days = this.calendar.getDaysInMonth(numberMonth);

        await this.drawTitle(monthName, year);
        this.drawTableHeader();
        this.drawTableBody(days, numberMonth);
    }

    private async drawTitle(monthName: string, year: number) {
        const title = `${monthName} ${year}`;
        const text = "Diciembre 2023 ";
        // const emojis = this.emojiManage.getEmojisInText(text);
        // const emojisHexa = this.emojiManage.transformEmojisToHexa(emojis);
        // console.log('emojisHexa', emojisHexa);


        const textWidth = this.doc.getTextWidth(title);

        const xOffset = (this.pageWidth / 2) - textWidth;

        this.doc.setFont("courier", "bold");
        this.doc.setFontSize(25);
        this.printText(title, xOffset, 12);

        const base64Image = await this.emojiManage.loadImageAsBase64('https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f367.png');
        const finalData = `data:image/png;base64,${base64Image}`;
        this.doc.addImage(finalData, 'PNG', xOffset, 20, 25, 25);

        // Aquí procesamos el texto para detectar y reemplazar los emojis por imágenes
        //         if (emojisHexa) {
        //             for (let emoji of emojisHexa) {
        //                 const emojiUrl = this.emojiManage.getEmojiURL(emoji);  // Obtener la URL del emoji
        // 
        //                 // Cargar la imagen y convertirla a base64
        //                 const base64Image = await this.emojiManage.loadImageAsBase64(emojiUrl);
        // 
        //                 // Usamos addImage para insertar el emoji como una imagen PNG en el PDF
        //                 this.doc.addImage(base64Image, "PNG", currentX, 20, 10, 10);  // Ajusta el tamaño de la imagen (10x10 es un ejemplo)
        // 
        //                 currentX += 12;  // Ajustar la posición X para que el siguiente emoji no se solape
        //             }
        //         }
    }

    private drawTableHeader(): void {
        this.doc.setFontSize(13);
        const weekDays = this.calendar.getWeekDays();
        for (let i = 0; i < weekDays.length; i++) {
            const xOffset = this.marginLeftTable + i * this.cellWidthTable;
            const yOffset = this.marginTopTable;

            this.doc.setDrawColor(128, 128, 128);

            const widthDay = this.doc.getTextWidth(weekDays[i]);
            this.printText(weekDays[i], xOffset + (this.cellWidthTable - widthDay) / 2, yOffset + 5.7)
            this.printBorder(xOffset, yOffset, this.cellWidthTable, 9);
        }

    }

    private drawTableBody(days: (number | null)[], numberMonth: number): void {
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
                if (day >= 10) {
                    this.printText(String(day), xOffset + this.cellWidthTable - 6.3, yOffset + 5.5);
                }
                else {
                    this.printText(String(day), xOffset + this.cellWidthTable - 5.15, yOffset + 5.3);
                }

                this.calendar.getEvent().forEach(item => {
                    const [dayEvent, monthEvent, nameEvent] = item.split('/');
                    if (+dayEvent === day && +monthEvent === numberMonth) {
                        this.printEvent(xOffset, yOffset, nameEvent);
                    }
                });
            }

            xOffset += this.cellWidthTable;
        }
    }

    private printEvent(xOffset: number, yOffset: number, nameEvent: string = this.calendar.getTextEvent()) {
        this.doc.setFontSize(10);
        nameEvent = this.truncateTextToFit(nameEvent, this.cellWidthTable - 10, this.cellHeightTable, this.doc.getLineHeightFactor() + 3.5);


        this.printText(nameEvent, xOffset + 2, yOffset + 4);
        this.printCircle(xOffset + this.cellWidthTable - 4, yOffset + 4, this.radio);
    }

    private truncateTextToFit(text: string, maxWidth: number, maxHeight: number, lineHeight: number): string {
        const phrases = text.split("#");

        let allLines: string[] = [];
        let totalHeight = 0;

        for (const phrase of phrases) {
            const words = phrase.split(" ");
            let lines: string[] = [];
            let currentLine = "";

            for (const word of words) {
                const testLine = currentLine ? `${currentLine} ${word}` : word;
                const testWidth = this.doc.getTextWidth(testLine);

                if (testWidth > maxWidth) {
                    if (this.doc.getTextWidth(word) > maxWidth) {
                        currentLine = this.splitWordAndAddToLines(word, lines, lineHeight, maxWidth, maxHeight, totalHeight);
                    } else {
                        lines.push(currentLine);
                        totalHeight += lineHeight;

                        if ((totalHeight + lineHeight) - 5 > maxHeight) {
                            allLines.push(lines.join("\n") + "...");
                            return allLines.join("\n");
                        }

                        currentLine = word;
                    }
                } else {
                    currentLine = testLine;
                }
            }

            if (currentLine) {
                lines.push(currentLine);
            }

            totalHeight += lineHeight;

            if (totalHeight + lineHeight > maxHeight) {
                allLines.push(lines.join("\n") + "...");
                return allLines.join("\n");
            }

            allLines.push(lines.join("\n"));

            if (phrases.indexOf(phrase) < phrases.length - 1) {
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


    private printText(text: string, xOffset: number, yOffset: number): void {
        this.doc.text(text, xOffset, yOffset);
        this.doc.setFontSize(this.fontsize);
    }

    private printBorder(xOffset: number, yOffset: number, width: number, height: number): void {
        this.doc.rect(xOffset, yOffset, width, height);
    }

    private printCircle(xOffset: number, yOffset: number, radio: number): void {
        this.doc.circle(xOffset, yOffset, radio, 'S');
    }

    // Guarda el PDF
    public save(filename: string): void {
        this.doc.save(filename);
    }
}
