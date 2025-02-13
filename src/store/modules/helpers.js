const purgeFilters = (newFilters) => {
  for (let prop in newFilters) {
    if (
      !newFilters[prop] ||
      newFilters[prop] === "" ||
      newFilters[prop] === null ||
      newFilters[prop] === undefined
    ) {
      delete newFilters[prop];
    }
    if (Array.isArray(newFilters[prop]) && !newFilters[prop].length) {
      delete newFilters[prop];
    }
  }
};

const today = new Date();

const currentMonth = today.getMonth();

const monthDays = [0, 2, 4, 6, 7, 9, 11].includes(currentMonth) ? 31 : 30;

const getToday = today.toISOString().substr(0, 10);

const firstWeekDay = () => {
  const year = today.getFullYear();

  // obtenemos el primer dia del año
  const firstDay = new Date(year, 0, 1);

  //obtengo la semana
  const numberOfDays = Math.floor((today - firstDay) / (24 * 60 * 60 * 1000));
  const week = Math.ceil((today.getDay() + 1 + numberOfDays) / 7);

  // obtenemos la corrección necesaria
  const correction = 6 - firstDay.getDay();

  // Retorno el lunes de la semana
  return new Date(year, 0, (week - 1) * 7 + 3 + correction)
    .toISOString()
    .substr(0, 10);
  // const lastWeekDay = new Date(year, 0, (week - 1) * 7 + 9 + correction);
};

const firstMonthDay = new Date(today.getFullYear(), today.getMonth(), 1)
  .toISOString()
  .substr(0, 10);

const getYesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  .toISOString()
  .substr(0, 10);

const getWeekAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000 * 7)
  .toISOString()
  .substr(0, 10);

const getWeekAfter = new Date(today.getTime() + 24 * 60 * 60 * 1000 * 7)
  .toISOString()
  .substr(0, 10);

const getMonthAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000 * monthDays)
  .toISOString()
  .substr(0, 10);

const getMonthAfter = new Date(
  today.getTime() + 24 * 60 * 60 * 1000 * monthDays
)
  .toISOString()
  .substr(0, 10);

export {
  purgeFilters,
  getToday,
  getYesterday,
  getWeekAgo,
  getWeekAfter,
  getMonthAgo,
  getMonthAfter,
  firstWeekDay,
  firstMonthDay,
};
