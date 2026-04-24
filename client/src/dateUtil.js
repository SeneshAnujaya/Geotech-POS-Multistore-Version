// Create a reusable formatter
const dateTimeFormatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  
  // Reusable function to format date and time
  export function formatDateTime(date) {
      if (!date) return "—";
    return dateTimeFormatter
      .format(new Date(date))
      .replaceAll("-", "/")
      .replace("a.m.", "AM")
      .replace("p.m.", "PM");
  }