/* global $ alert */
/* global MutationObserver */

const events = [];
main();

function main () {
  initYearPicker();
  initDatePicker(new Date().getFullYear());

  addEventHandlers();
}

function renderEventList (day, month, name) {
  const list = document.getElementById('event-list');

  const itemList = document.createElement('li');
  itemList.classList.add('event-item');

  const spanDate = document.createElement('span');
  spanDate.classList.add('event-date');
  spanDate.textContent = `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;

  const spanName = document.createElement('span');
  spanName.classList.add('event-name');
  spanName.textContent = name;

  const removeBtn = document.createElement('button');
  removeBtn.textContent = 'x';
  removeBtn.classList.add('btn-delete-event');
  removeBtn.addEventListener('click', () => {
    const textToRemove = `${spanDate.textContent}/${name}`;
    const index = events.indexOf(textToRemove);
    if (index !== -1) events.splice(index, 1);
    list.removeChild(itemList);
  });

  itemList.appendChild(spanDate);
  itemList.appendChild(spanName);
  itemList.appendChild(removeBtn);

  list.appendChild(itemList);
}

function addEventHandlers () {
  // Create event to add event to the list
  document.querySelector('#btn-submit-add-event').addEventListener('click', () => {
    const $inputDate = document.getElementById('input-date');
    const $inputEvent = document.getElementById('name-event');
    const rawDate = $inputDate.value;
    const nameEvent = $inputEvent.value.trim();

    if (!rawDate || !nameEvent) {
      alert('Please, select a date and write a name to the event.');
      return;
    }

    const [day, month] = rawDate.split('/');
    const formattedEvent = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${nameEvent}`;
    events.push(formattedEvent);

    renderEventList(day, month, nameEvent);
    $inputDate.value = '';
    $inputEvent.value = '';
  });

  // Create event Submit form to generate calendar
  document.querySelector('.form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const year = document.getElementById('input-year').value;

    const spinner = document.getElementById('spinner');
    const submitBtn = document.getElementById('submit-btn');
    submitBtn.disabled = true;
    spinner.style.visibility = 'visible';

    try {
      const response = await fetch('/generate', {
        method: 'POST',
        body: JSON.stringify({ year, events }),
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Error generating PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Calendar_${year}.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      clearEventList();
      events.length = 0;
    } catch (error) {
      console.error('ERROR /generate:', error);
    } finally {
      spinner.style.visibility = 'hidden';
      submitBtn.disabled = false;
    }
  });
}

function clearEventList () {
  document.getElementById('event-list').textContent = '';
}

function initYearPicker () {
  const yearPicker = $('#input-year');
  yearPicker.datepicker({
    format: 'yyyy',
    viewMode: 'years',
    minViewMode: 'years',
    autoclose: true,
    orientation: 'bottom auto'
  });

  yearPicker.datepicker('update', new Date());

  yearPicker.on('changeDate', function (e) {
    const selectedYear = e.date.getFullYear();
    initDatePicker(selectedYear);
  });
}

function initDatePicker (year) {
  const datePicker = $('#input-date');
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);
  // Destroy the previous instance if it exists
  datePicker.datepicker('destroy');
  datePicker.datepicker({
    format: 'dd/mm',
    startView: 1,
    minViewMode: 0,
    autoclose: true,
    orientation: 'bottom auto',
    todayHighlight: false,
    startDate,
    endDate
  }).on('show', function () {
    // Start when the element is load
    disableDaySelection();
    disableMonthSelection();
    removeClickYearInMonthSelection();
  });
}

function removeClickYearInMonthSelection () {
  const switches = document.querySelectorAll('.datepicker-switch');
  const stopClick = (e) => {
    e.stopImmediatePropagation();
    e.preventDefault();
  };
  switches.forEach(sw => {
    sw.removeEventListener('click', stopClick, true);
    sw.addEventListener('click', stopClick, true);
    sw.style.pointerEvents = 'none';
    sw.style.cursor = 'default';
  });
}

function disableMonthSelection () {
  const months = document.querySelectorAll('.datepicker-months .month');
  months.forEach(month => {
    if (month.classList.contains('active') || month.classList.contains('focused')) {
      month.classList.remove('active', 'focused');
    }
  });
}

function disableDaySelection () {
  const observer = new MutationObserver(() => {
    $('.datepicker-days td.active, .datepicker-days td.focused, .datepicker-days td.today').removeClass('active focused today').css({
      'background-color': 'white'
    });
  });

  const daysContainer = document.querySelector('.datepicker-days');
  if (daysContainer) {
    observer.observe(daysContainer, { childList: true, subtree: true });
  }
}
