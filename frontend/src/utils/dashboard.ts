import { dayjs } from 'frappe-ui'

export function getLastXDays(range: number = 30): string | null {
  const today = new Date()
  const lastXDate = new Date(today)
  lastXDate.setDate(today.getDate() - range)

  return `${dayjs(lastXDate).format('YYYY-MM-DD')},${dayjs(today).format(
    'YYYY-MM-DD',
  )}`
}

// NTV: khoảng ngày dạng "YYYY-MM-DD,YYYY-MM-DD" mà bộ lọc dashboard đang dùng.
function period(from: any, to: any): string {
  return `${from.format('YYYY-MM-DD')},${to.format('YYYY-MM-DD')}`
}

// NTV: 6 mốc bấm nhanh. Chu kỳ bán hàng đo bằng tuần/tháng, nhưng người điều hành
// vẫn hỏi "hôm nay bao nhiêu lead" — mà 7/30/60/90 ngày không trả lời được câu đó.
export function getToday(): string {
  return period(dayjs(), dayjs())
}

export function getYesterday(): string {
  const d = dayjs().subtract(1, 'day')
  return period(d, d)
}

export function getThisWeek(): string {
  return period(dayjs().startOf('week'), dayjs())
}

export function getThisMonth(): string {
  return period(dayjs().startOf('month'), dayjs())
}

export function getLastMonth(): string {
  const m = dayjs().subtract(1, 'month')
  return period(m.startOf('month'), m.endOf('month'))
}

export function getThisYear(): string {
  return period(dayjs().startOf('year'), dayjs())
}

export function formatter(range: string) {
  const [from, to] = range.split(',')
  return `${formatRange(from)} to ${formatRange(to)}`
}

export function formatRange(date: string) {
  const dateObj = new Date(date)
  // NTV: bám ngôn ngữ đang dùng thay vì đóng cứng 'en-US' — site chạy tiếng Việt
  // thì nhãn khoảng ngày cũng phải là tiếng Việt.
  const locale =
    (typeof document !== 'undefined' && document.documentElement.lang) ||
    (typeof navigator !== 'undefined' && navigator.language) ||
    'en-US'
  return dateObj.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year:
      dateObj.getFullYear() === new Date().getFullYear()
        ? undefined
        : 'numeric',
  })
}
