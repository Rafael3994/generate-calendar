const readline = require('readline');

interface IInput {
    year: undefined | number;
    holidays: string[];
}

export default class ReadInputUser {
    public static readTermenalCommand() {
        const input: IInput = {
            year: undefined,
            holidays: [],
        };

        const args = process.argv.slice(2);
        const year = parseInt(args[0], 10);
        console.log(args);

        if (!isNaN(year)) {
            input.year = year;
            return year;
        } else {
            throw new Error("Por favor, introduce un número válido.")
        }
    }
}