export default class Calendar {
    private year: number;
    private events: string[];

    private textEvent = 'New Event';

    private weekDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    private monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    constructor(year: number, events: string[]) {
        this.year = year;
        this.events = this.unifyEventsByDate(events);
    }

    private unifyEventsByDate(events: string[]): string[] {
        const groupedEvents: { [key: string]: string[] } = {};
        events.forEach(event => {
            const [dayEvent, monthEvent, textEvent = this.textEvent] = event.split('/');
            const dateEvent = this.formatDate(dayEvent) + '/' + this.formatDate(monthEvent);

            if (!groupedEvents[dateEvent]) {
                groupedEvents[dateEvent] = [];
            }

            groupedEvents[dateEvent].push(textEvent);
        });

        return Object.keys(groupedEvents).map(date => {
            return `${date}/${groupedEvents[date].join('#')}`;
        });
    }

    private formatDate(date: string): string {
        return date.padStart(2, '0');
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

    public getWeekDays(): string[] {
        return this.weekDays;
    }

    public getYear(): number {
        return this.year
    }

    public getTextEvent(): string {
        return this.textEvent
    }

    public getEvent(): string[] {
        return this.events
    }
}