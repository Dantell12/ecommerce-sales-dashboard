export interface ErrorDto {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}
