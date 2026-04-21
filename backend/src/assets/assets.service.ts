import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { AssetAssignment } from './entities/asset-assignment.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(AssetAssignment)
    private readonly assetAssignmentRepository: Repository<AssetAssignment>,
  ) {}

  async findAllAssets(): Promise<Asset[]> {
    return this.assetRepository.find();
  }

  async createAsset(data: Partial<Asset>): Promise<Asset> {
    const asset = this.assetRepository.create(data);
    return this.assetRepository.save(asset);
  }

  async findAllAssignments(): Promise<AssetAssignment[]> {
    return this.assetAssignmentRepository.find({ relations: ['asset'] });
  }

  async assignAsset(data: Partial<AssetAssignment>): Promise<AssetAssignment> {
    if (!data.asset?.id) {
      throw new Error('Asset ID is required to assign an asset');
    }
    const assignment = this.assetAssignmentRepository.create(data);
    await this.assetRepository.update(data.asset.id, { status: 'Assigned' });
    return this.assetAssignmentRepository.save(assignment);
  }
}
