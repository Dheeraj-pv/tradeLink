// repositories/base.repository.ts
import { DatabaseError } from '@/lib/errors';

export type PaginationOptions = {
  page?: number;
  limit?: number;
  orderBy?: any;
};

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export abstract class BaseRepository<T extends Record<string, unknown>> {
  protected model: any;

  constructor(model: any) {
    this.model = model;
  }

  /**
   * Find a record by ID
   */
  async findById(id: string, include?: any): Promise<T | null> {
    try {
      return await this.model.findUnique({
        where: { id },
        ...(include ? { include } : {}),
      });
    } catch (error: any) {
      throw new DatabaseError(`Failed to find record with id ${id}: ${error.message}`);
    }
  }

  /**
   * Find all records with pagination and filtering
   */
  async findAll(params: {
    where?: any;
    include?: any;
    skip?: number;
    take?: number;
    orderBy?: any;
  }): Promise<{ data: T[]; total: number }> {
    try {
      const [data, total] = await Promise.all([
        this.model.findMany({
          where: params.where || {},
          include: params.include || {},
          skip: params.skip || 0,
          take: params.take || 50,
          orderBy: params.orderBy || { createdAt: 'desc' },
        }),
        this.model.count({ where: params.where || {} }),
      ]);
      return { data, total };
    } catch (error: any) {
      throw new DatabaseError(`Failed to find records: ${error.message}`);
    }
  }

  /**
   * Create a new record
   */
  async create(data: Partial<T>): Promise<T> {
    try {
      return await this.model.create({ data });
    } catch (error: any) {
      throw new DatabaseError(`Failed to create record: ${error.message}`);
    }
  }

  /**
   * Update a record
   */
  async update(id: string, data: Partial<T>): Promise<T> {
    try {
      return await this.model.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      throw new DatabaseError(`Failed to update record with id ${id}: ${error.message}`);
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<T> {
    try {
      return await this.model.delete({ where: { id } });
    } catch (error: any) {
      throw new DatabaseError(`Failed to delete record with id ${id}: ${error.message}`);
    }
  }

  /**
   * Execute a transaction
   */
  async transaction<R>(callback: (tx: any) => Promise<R>): Promise<R> {
    try {
      return await this.model.$transaction(callback);
    } catch (error: any) {
      throw new DatabaseError(`Transaction failed: ${error.message}`);
    }
  }

  /**
   * Get pagination parameters
   */
  protected getPagination(page: number = 1, limit: number = 10): { skip: number; take: number } {
    const validPage = Math.max(1, page);
    const validLimit = Math.min(100, Math.max(1, limit));
    return {
      skip: (validPage - 1) * validLimit,
      take: validLimit,
    };
  }

  /**
   * Get paginated result
   */
  protected async getPaginatedResult(
    params: {
      where?: any;
      include?: any;
      orderBy?: any;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<PaginatedResult<T>> {
    const { skip, take } = this.getPagination(page, limit);
    const [data, total] = await Promise.all([
      this.model.findMany({
        where: params.where || {},
        include: params.include || {},
        skip,
        take,
        orderBy: params.orderBy || { createdAt: 'desc' },
      }),
      this.model.count({ where: params.where || {} }),
    ]);

    return {
      data,
      total,
      page,
      limit: take,
      totalPages: Math.ceil(total / take),
    };
  }
}