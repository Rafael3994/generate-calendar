const readline = require('readline');

interface IInput {
    year: number;
    holidays: string[];
}

export default class ReadInputUser {
    public static readTermenalCommand() {
        const args = process.argv.slice(2);
        const year = parseInt(args[0], 10);

        if (!isNaN(year)) {
            return { year, holidays: JSON.parse(args[1]) };
        } else {
            throw new Error("Por favor, introduce un número válido.")
        }
    }
}