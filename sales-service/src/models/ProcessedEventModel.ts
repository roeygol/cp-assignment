import { Model, DataTypes, Sequelize } from 'sequelize';
import { ProcessedEvent } from '../types/index.js';

export class ProcessedEventModel extends Model<ProcessedEvent, Omit<ProcessedEvent, 'createdAt' | 'updatedAt'>> {
  declare eventId: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initializeProcessedEventModel(sequelize: Sequelize): typeof ProcessedEventModel {
  ProcessedEventModel.init({
    eventId: { type: DataTypes.STRING, primaryKey: true },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  }, { 
    sequelize, 
    tableName: 'processed_events', 
    timestamps: true 
  });

  return ProcessedEventModel;
}
