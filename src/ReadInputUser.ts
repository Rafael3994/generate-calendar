const readline = require('readline');

export default class ReadInputUser {
    private rl;
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
}