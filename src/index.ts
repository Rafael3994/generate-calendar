import Calendar from "./Calendar.ts";
import { GeneratePDF } from "./GeneratePDF.ts";
import ReadInputUser from "./ReadInputUser.ts";
import path from "path";
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

interface RequestBody {
    year: string;
}

app.post("/generate", async (req: Request<{}, {}, RequestBody>, res: Response) => {
    const { year } = req.body;

    try {
        const calendar = new Calendar(parseInt(year), []);
        const pdfGenerator = new GeneratePDF(calendar);
        pdfGenerator.drawCalendarYear();

        const buffer = pdfGenerator.getBuffer();
        console.log('PDF Buffer size:', buffer.byteLength);
        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="Calendar_${year}.pdf"`,
        });
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('ERROR - POST /generate', error);
        res.status(500).send("Error generating PDF");
    }

});

app.listen(PORT, () => {
    console.log(`Servidor en http://localhost:${PORT}`);
});

(() => {
    try {
        const { year, holidays } = ReadInputUser.readTermenalCommand();
        if (year === null) return;
        const calendar = new Calendar(year, holidays);
        const pdfGenerator = new GeneratePDF(calendar);
        pdfGenerator.drawCalendarYear();

        pdfGenerator.save(`calendar_${year}.pdf`);
    } catch (error) {
        console.log(error);
    }
})();
