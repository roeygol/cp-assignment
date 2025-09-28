import { Transaction } from 'sequelize';
import { BaseRepository } from './BaseRepository.js';
import { ProcessedEventModel } from '../models/ProcessedEventModel.js';

export class ProcessedEventRepository extends BaseRepository<ProcessedEventModel> {
  constructor() {
    super(ProcessedEventModel);
  }

  protected getPrimaryKey(): string {
    return 'eventId';
  }

  async findByEventId(eventId: string): Promise<ProcessedEventModel | null> {
    return await this.model.findByPk(eventId);
  }

  async createProcessedEvent(eventId: string, transaction?: Transaction): Promise<ProcessedEventModel> {
    return await this.model.create({ eventId }, transaction ? { transaction } : {});
  }

  async isEventProcessed(eventId: string): Promise<boolean> {
    const event = await this.findByEventId(eventId);
    return event !== null;
  }
}
