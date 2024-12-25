import jsPDF from "jspdf";
import Calendar from "./Calendar.ts";

export class GeneratePDF {
    private calendar: Calendar;
    private doc: jsPDF;

    private pageWidth: number;
    private cellWidth: number;
    private cellHeight: number;
    private calendarWidth: number;
    private marginLeft: number;
    private marginTop: number;
    private radio: number;
    private fontsize: number;

    constructor(calendar: Calendar) {
        this.calendar = calendar;
        this.doc = new jsPDF({ orientation: "landscape" });
        this.pageWidth = this.doc.internal.pageSize.width;
        this.cellWidth = 36;
        this.cellHeight = 30;
        this.calendarWidth = this.cellWidth * 7;
        this.marginLeft = (this.pageWidth - this.calendarWidth) / 2;
        this.marginTop = 14;
        this.radio = 3.3;
        this.fontsize = 12;
    }

    public drawCalendarYear(): void {
        for (let index = 1; index <= 12; index++) {
            this.drawCalendar(index);
            if (index !== 12) this.doc.addPage('a4', 'landscape');
        }
    }

    public drawCalendar(numberMonth: number): void {
        const monthName = this.calendar.getMonthName(numberMonth);
        const year = this.calendar.getYear();
        const days = this.calendar.getDaysInMonth(numberMonth);

        this.drawTitle(monthName, year);
        this.drawHeader();
        this.drawBody(days, numberMonth);
    }

    private drawTitle(monthName: string, year: number): void {
        const title = `${monthName} ${year}`;
        const textWidth = this.doc.getTextWidth(title);

        const xOffset = (this.pageWidth / 2) - textWidth;

        this.doc.setFont("courier", "bold");
        this.doc.setFontSize(25);
        this.printText(title, xOffset, 10);
    }

    private drawHeader(): void {
        this.doc.setFontSize(13);
        const weekDays = this.calendar.getWeekDays();
        for (let i = 0; i < weekDays.length; i++) {
            const xOffset = this.marginLeft + i * this.cellWidth;
            const yOffset = this.marginTop;

            this.doc.setDrawColor(128, 128, 128);

            const widthDay = this.doc.getTextWidth(weekDays[i]);
            this.printText(weekDays[i], xOffset + (this.cellWidth - widthDay) / 2, yOffset + 7.5)
            this.printBorder(xOffset, yOffset, this.cellWidth, 12);
        }

    }

    private drawBody(days: (number | null)[], numberMonth: number): void {
        let xOffset = this.marginLeft;
        let yOffset = this.marginTop + 12;
        this.doc.setFont("helvetica", "normal");

        for (let i = 0; i < days.length; i++) {
            const day = days[i];

            if (i > 0 && i % 7 === 0) {
                xOffset = this.marginLeft;
                yOffset += this.cellHeight;
            }

            this.printBorder(xOffset, yOffset, this.cellWidth, this.cellHeight);
            if (day !== null) {
                if (day >= 10) {
                    this.printText(String(day), xOffset + this.cellWidth - 6.3, yOffset + 5.5);
                }
                else {
                    this.printText(String(day), xOffset + this.cellWidth - 5.15, yOffset + 5.3);
                }

                this.calendar.getHolidays().forEach(item => {
                    const [dayHoliday, monthHoliday, nameHoliday] = item.split('/');

                    if (+dayHoliday === day && +monthHoliday === numberMonth) {
                        this.printHoliday(xOffset, yOffset, nameHoliday);
                    }
                });

            }

            xOffset += this.cellWidth;
        }
    }

    private printHoliday(xOffset: number, yOffset: number, nameHoliday: string = this.calendar.getTextHolidays()) {
        this.doc.setFontSize(10);
        const textWidth = this.doc.getTextWidth(nameHoliday);

        if (textWidth > this.cellWidth - 5) console.log(nameHoliday);

        nameHoliday = this.truncateTextByWidth(nameHoliday, this.cellWidth - 16);


        this.printText(nameHoliday, xOffset + (this.cellWidth / 2) - (textWidth / 2), yOffset + 5.5);
        this.printCircle(xOffset + this.cellWidth - 4, yOffset + 4, this.radio);
    }

    private truncateTextByWidth(text: string, maxWidth: number) {
        let truncatedText = text;
        while (this.doc.getTextWidth(truncatedText) > maxWidth) {
            truncatedText = truncatedText.slice(0, -1);
        }

        if (truncatedText !== text) {
            truncatedText += "...";
        }

        return truncatedText;
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