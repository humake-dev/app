export const formatDate = (dateStr, locale) =>
  new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });



export const formatSelectedDate = (dateString: string, i18n) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-').map(Number);

  // UTC 변환으로 날짜가 하루 밀리는 문제 방지
  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat(
    i18n.resolvedLanguage || i18n.language,
    {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    }
  ).format(date);
};