import Calendar from "./Calendar.ts";
import { GeneratePDF } from "./GeneratePDF.ts";

const input: number = 2025;

const calendar = new Calendar(input);
const pdfGenerator = new GeneratePDF(calendar);
pdfGenerator.drawCalendarYear();

pdfGenerator.save(`calendar_${input}.pdf`);