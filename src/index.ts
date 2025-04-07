import Calendar from "./Calendar.ts";
import { GeneratePDF } from "./GeneratePDF.ts";
import ReadInputUser from "./ReadInputUser.ts";
import path from "path";
import express, { Request, Response } from 'express';
import bodyParser from "body-parser";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="calendar_${year}.pdf"`,
        });
        res.send(Buffer.from(pdfGenerator.getBuffer()));
    } catch (error) {
        console.error(error);
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
