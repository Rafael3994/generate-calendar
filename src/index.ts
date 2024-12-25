import Calendar from "./Calendar.ts";
import { GeneratePDF } from "./GeneratePDF.ts";
import ReadInputUser from "./ReadInputUser.ts";

try {
    const { year, holidays } = ReadInputUser.readTermenalCommand();
    const calendar = new Calendar(year, holidays);
    const pdfGenerator = new GeneratePDF(calendar);
    pdfGenerator.drawCalendarYear();

    pdfGenerator.save(`calendar_${year}.pdf`);
} catch (error) {
    console.log(error);

}
