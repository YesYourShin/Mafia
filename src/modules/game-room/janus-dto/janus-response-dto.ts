export class JanusResponseDto<T> {
  janus: string;

  transaction: string;

  response: T;
}
