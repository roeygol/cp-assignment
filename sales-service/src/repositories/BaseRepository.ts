import { Model, ModelCtor, Transaction } from 'sequelize';

export abstract class BaseRepository<T extends Model> {
  protected model: ModelCtor<T>;

  constructor(model: ModelCtor<T>) {
    this.model = model;
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findByPk(id);
  }

  async findAll(): Promise<T[]> {
    return await this.model.findAll();
  }

  async create(data: any, transaction?: Transaction): Promise<T> {
    return await this.model.create(data, transaction ? { transaction } : {});
  }

  async update(id: string, data: any, transaction?: Transaction): Promise<[number, T[]]> {
    const whereClause = { [this.getPrimaryKey()]: id } as any;
    const result = await this.model.update(data, { 
      where: whereClause,
      ...(transaction && { transaction }),
      returning: true
    });
    return result as [number, T[]];
  }

  async delete(id: string, transaction?: Transaction): Promise<number> {
    const whereClause = { [this.getPrimaryKey()]: id } as any;
    return await this.model.destroy({ 
      where: whereClause,
      ...(transaction && { transaction })
    });
  }

  async count(): Promise<number> {
    return await this.model.count();
  }

  protected abstract getPrimaryKey(): string;
}
