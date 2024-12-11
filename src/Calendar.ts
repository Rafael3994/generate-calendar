export default class Calendar {
    private year: number;

    private weekDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    private monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    constructor(year: number) {
        this.year = year;
    }

    public getDaysInMonth(month: number) {
        const totalDaysInMonth = new Date(this.year, month, 0).getDate()
        const firstDay = new Date(this.year, month - 1, 1).getDay();
        const adjustedFirstDay = (firstDay === 0 ? 6 : firstDay - 1);

        const daysArray: (number | null)[] = []
        for (let i = 0; i < adjustedFirstDay; i++) {
            daysArray.push(null);
        }
        for (let i = 1; i <= totalDaysInMonth; i++) {
            daysArray.push(i);
        }

        return daysArray;
    }

    public getMonthName(month: number): string {
        return this.monthNames[month - 1];
    }

    public getWeekDays() {
        return this.weekDays;
    }
}