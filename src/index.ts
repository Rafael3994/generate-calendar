import Calendar from "./Calendar.ts";
import { GeneratePDF } from "./GeneratePDF.ts";
import ReadInputUser from "./ReadInputUser.ts";

// const input: number = 2025;

try {
    const input = ReadInputUser.readTermenalCommand();
    const calendar = new Calendar(input);
    const pdfGenerator = new GeneratePDF(calendar);
    pdfGenerator.drawCalendarYear();

    pdfGenerator.save(`calendar_${input}.pdf`);
} catch (error) {
    console.log(error);

}
