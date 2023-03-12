import { CleaningHistory } from '../entities/cleaning-history.entity';

export class ResponseQueryCleaningHistoryDto {
  cleaningHistories: CleaningHistory[];

  total: number;
}
