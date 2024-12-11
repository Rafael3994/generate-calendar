const readline = require('readline');

export default class ReadInputUser {
    public static readTermenalCommand() {
        const args = process.argv.slice(2); // Ignora los primeros dos elementos
        const numero = parseInt(args[0], 10);

        if (!isNaN(numero)) {
            return numero;
        } else {
            throw new Error("Por favor, introduce un número válido.")
        }
    }
}