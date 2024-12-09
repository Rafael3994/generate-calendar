import { jsPDF } from "jspdf";

// Función para obtener los días del mes
function getDaysInMonth(month: number, year: number) {
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = new Date(year, month - 1, 1).getDay();
    const adjustedFirstDay = (firstDay === 0 ? 6 : firstDay - 1); // Ajustar para que lunes sea el primer día

    const daysArray = [];
    for (let i = 0; i < adjustedFirstDay; i++) {
        daysArray.push({ day: null }); // Días vacíos al inicio
    }
    for (let i = 1; i <= daysInMonth; i++) {
        daysArray.push({ day: i });
    }
    return daysArray;
}

// Función para generar el PDF con el calendario
function generateCalendarPDF(month: number, year: number) {
    const doc = new jsPDF({ orientation: "landscape" });

    const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];

    const monthName = monthNames[month - 1];
    const title = `${monthName} ${year}`;

    const pageWidth = doc.internal.pageSize.width;

    // Centrar el título
    const textWidth = doc.getTextWidth(title);
    const titleX = (pageWidth - textWidth) / 2;

    doc.setFont("courier", "bold");
    doc.setDrawColor(128, 128, 128);
    doc.setFontSize(25);
    doc.text(title, titleX, 20);

    const daysInMonth = getDaysInMonth(month, year);
    const weekDays = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

    const cellWidth = 36; // Ancho de las celdas
    const cellHeight = 30; // Altura de las celdas
    const calendarWidth = cellWidth * 7; // Ancho total del calendario

    // Calcular márgenes iniciales para centrar
    const marginLeft = (pageWidth - calendarWidth) / 2;
    const marginTop = 30;

    // Dibujar los días de la semana
    doc.setFontSize(13);
    for (let i = 0; i < weekDays.length; i++) {
        const xOffset = marginLeft + i * cellWidth;
        const yOffset = marginTop;

        // Dibujar el texto del día
        const widthDay = doc.getTextWidth(weekDays[i]);
        doc.text(weekDays[i], xOffset + (cellWidth - widthDay) / 2, yOffset + 7.5); // Ajustar para centrar en la celda

        // Dibujar el borde alrededor del texto
        doc.rect(xOffset, yOffset, cellWidth, 12); // Rectángulo más ancho
    }

    // Dibujar las celdas del calendario
    let xOffset = marginLeft;
    let yOffset = marginTop + 12; // Espacio debajo de los días de la semana

    doc.setFont("helvetica", "normal");
    for (let i = 0; i < daysInMonth.length; i++) {
        const day = daysInMonth[i];

        if (i > 0 && i % 7 === 0) { // Nueva fila
            xOffset = marginLeft;
            yOffset += cellHeight;
        }

        // Dibujar el borde de la celda
        doc.rect(xOffset, yOffset, cellWidth, cellHeight);
        if (day.day !== null) {
            if (day.day > 9) {
                // Escribir el número del día en la esquina superior derecha
                doc.text(String(day.day), xOffset + cellWidth - 7, yOffset + 6);
            } else {
                doc.text(String(day.day), xOffset + cellWidth - 5, yOffset + 6);
            }

        }

        // Avanzar a la siguiente celda
        xOffset += cellWidth;
    }

    doc.save(`calendar_${month}_${year}.pdf`);
}

// Ejemplo de uso
generateCalendarPDF(2, 2025);
