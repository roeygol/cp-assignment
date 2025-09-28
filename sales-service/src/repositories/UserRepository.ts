import { Model, DataTypes, Sequelize } from 'sequelize';
import { User } from '../types/index.js';

export class UserModel extends Model<User, Omit<User, 'createdAt' | 'updatedAt'>> {
  declare id: string;
  declare email: string;
  declare password: string;
  declare role: string;
  declare createdAt: Date;
  declare updatedAt: Date;
}

export function initializeUserModel(sequelize: Sequelize): typeof UserModel {
  UserModel.init({
    id: { 
      type: DataTypes.STRING, 
      primaryKey: true 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: false 
    },
    role: { 
      type: DataTypes.STRING, 
      allowNull: false,
      defaultValue: 'customer'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, { 
    sequelize, 
    tableName: 'users',
    timestamps: true
  });

  return UserModel;
}

export class UserRepository {
  constructor(private model: typeof UserModel) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.model.findOne({ where: { email } });
    return user ? user.toJSON() : null;
  }

  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const user = await this.model.create(userData);
    return user.toJSON();
  }

}
