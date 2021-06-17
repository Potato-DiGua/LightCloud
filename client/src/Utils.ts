export function timestampToTime(timestamp: number) {
  const date = new Date(timestamp * 1000); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  const Y = date.getFullYear();
  const M = fillWithZero(date.getMonth() + 1, 2);
  const D = fillWithZero(date.getDate(), 2);
  const h = fillWithZero(date.getHours(), 2);
  const m = fillWithZero(date.getMinutes(), 2);
  const s = fillWithZero(date.getSeconds(), 2);
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

export function fillWithZero(value: number, length: number): string {
  let result = value.toString();
  let size = length - result.length;
  for (let i = 0; i < size; i++) {
    result = "0" + result;
  }
  return result;
}
