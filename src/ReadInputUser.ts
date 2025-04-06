const readline = require('readline');

interface IInput {
    year: number | null;
    holidays: string[];
}

export default class ReadInputUser {
    public static readTermenalCommand(): IInput {
        const args = process.argv.slice(2);
        const year = parseInt(args[0], 10);

        if (!isNaN(year)) {
            return { year, holidays: JSON.parse(args[1]) };
        } else {
            console.log("No parameters have been entered by command")
            return { year: null, holidays: [] };
        }
    }
}