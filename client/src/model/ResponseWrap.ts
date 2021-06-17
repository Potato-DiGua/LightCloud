export interface ResponseWrap<T> {
  status: number;
  msg: string;
  data: T;
}
