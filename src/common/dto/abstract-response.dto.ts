export class AbstractResponseDto<T> {
  success: boolean;
  status: number;
  data: T;
}
