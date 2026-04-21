import { Controller, Get, Post, Body } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Asset } from './entities/asset.entity';
import { AssetAssignment } from './entities/asset-assignment.entity';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  findAllAssets(): Promise<Asset[]> {
    return this.assetsService.findAllAssets();
  }

  @Post()
  createAsset(@Body() data: Partial<Asset>): Promise<Asset> {
    return this.assetsService.createAsset(data);
  }

  @Get('assignments')
  findAllAssignments(): Promise<AssetAssignment[]> {
    return this.assetsService.findAllAssignments();
  }

  @Post('assignments')
  assignAsset(@Body() data: Partial<AssetAssignment>): Promise<AssetAssignment> {
    return this.assetsService.assignAsset(data);
  }
}
