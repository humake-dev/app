export const formatDate = (dateStr, locale) =>
  new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });