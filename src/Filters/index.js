export function fechaDiaMesAnio(value) {
  try {
    return (
      value.substr(8, 2) + "/" + value.substr(5, 2) + "/" + value.substr(0, 4)
    );
  } catch (e) {
    return value;
  }
}

export function fechaText(value) {
  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const date = new Date(value.substring(0, 10) + " 00:00:00");
  return (
    date.getDate() +
    " de " +
    months[date.getMonth()] +
    " " +
    date.getUTCFullYear()
  );
}

export function reduceText(text, length = 20) {
  if (text.length > length) {
    return text.substr(0, length) + "...";
  } else {
    return text;
  }
}

export function fullName(user) {
  if (user?.first_name && user?.last_name) {
    return `${user.first_name} ${user.last_name}`;
  } else {
    return "Sin datos";
  }
}

export function facilityName(facility) {
  if (facility?.name) {
    return `${facility.name}`;
  } else {
    return "Sin datos";
  }
}

export function readableFileSize(size) {
  const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let i = 0;
  while (size >= 1024) {
    size /= 1024;
    ++i;
  }
  return size.toFixed(1) + " " + units[i];
}
