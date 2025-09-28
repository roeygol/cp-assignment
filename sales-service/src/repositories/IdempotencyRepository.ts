import { Model, DataTypes, Sequelize, Transaction, Op } from 'sequelize';

export interface IdempotencyResponse {
  idempotencyKey: string;
  statusCode: number;
  response: any;
  createdAt: Date;
  expiresAt: Date;
}

export class IdempotencyModel extends Model<IdempotencyResponse, Omit<IdempotencyResponse, 'createdAt'>> {
  declare idempotencyKey: string;
  declare statusCode: number;
  declare response: any;
  declare createdAt: Date;
  declare expiresAt: Date;
}

export function initializeIdempotencyModel(sequelize: Sequelize): typeof IdempotencyModel {
  IdempotencyModel.init({
    idempotencyKey: { 
      type: DataTypes.STRING, 
      primaryKey: true 
    },
    statusCode: { 
      type: DataTypes.INTEGER, 
      allowNull: false 
    },
    response: { 
      type: DataTypes.JSON, 
      allowNull: false 
    },
    expiresAt: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, { 
    sequelize, 
    tableName: 'idempotency_responses',
    timestamps: true,
    createdAt: true,
    updatedAt: false
  });

  return IdempotencyModel;
}

export class IdempotencyRepository {
  constructor(private model: typeof IdempotencyModel) {}

  async getResponse(idempotencyKey: string): Promise<IdempotencyResponse | null> {
    const response = await this.model.findOne({
      where: { 
        idempotencyKey,
        expiresAt: {
          [Op.gt]: new Date()
        }
      }
    });

    return response ? response.toJSON() : null;
  }

  async saveResponse(idempotencyKey: string, statusCode: number, response: any, transaction?: Transaction): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire after 24 hours

    const createOptions = transaction ? { transaction } : {};
    await this.model.create({
      idempotencyKey,
      statusCode,
      response,
      expiresAt
    }, createOptions);
  }

  async deleteExpiredResponses(): Promise<number> {
    const result = await this.model.destroy({
      where: {
        expiresAt: {
          [Op.lt]: new Date()
        }
      }
    });

    return result;
  }
}
