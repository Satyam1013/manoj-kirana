import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RiceMillService } from './rice-mill.service';
import { CreateMillDto } from './dto/mill.dto';
import { CreateIntakeEntryDto } from './dto/intake-entry.dto';
import { CreateOutputEntryDto } from './dto/output-entry.dto';

@UseGuards(JwtAuthGuard)
@Controller('rice-mill')
export class RiceMillController {
  constructor(private riceMill: RiceMillService) {}

  /* mills */
  @Get('mills')
  listMills(@Query('search') search?: string): Promise<any[]> {
    return this.riceMill.listMills(search);
  }

  @Get('mills/:id')
  getMill(@Param('id') id: string) {
    return this.riceMill.getMill(id);
  }

  @Post('mills')
  createMill(@Body() dto: CreateMillDto) {
    return this.riceMill.createMill(dto);
  }

  @Delete('mills/:id')
  deleteMill(@Param('id') id: string) {
    return this.riceMill.deleteMill(id);
  }

  /* intake entries */
  @Get('mills/:millId/intake')
  listIntakeEntries(
    @Param('millId') millId: string,
    @Query('partyType') partyType?: 'private' | 'government',
    @Query('search') search?: string,
  ) {
    return this.riceMill.listIntakeEntries(millId, partyType, search);
  }

  @Post('intake')
  createIntakeEntry(@Body() dto: CreateIntakeEntryDto) {
    return this.riceMill.createIntakeEntry(dto);
  }

  /* output entries */
  @Get('mills/:millId/output')
  listOutputEntries(
    @Param('millId') millId: string,
    @Query('partyType') partyType?: 'private' | 'government',
    @Query('search') search?: string,
  ) {
    return this.riceMill.listOutputEntries(millId, partyType, search);
  }

  @Post('output')
  createOutputEntry(@Body() dto: CreateOutputEntryDto) {
    return this.riceMill.createOutputEntry(dto);
  }

  /* entries (shared delete, disambiguated by ?type=) */
  @Delete('entries/:id')
  deleteEntry(@Param('id') id: string, @Query('type') type?: 'intake' | 'output') {
    if (type !== 'intake' && type !== 'output') {
      throw new BadRequestException("Query param 'type' must be 'intake' or 'output'");
    }
    return this.riceMill.deleteEntry(id, type);
  }

  /* summary */
  @Get('mills/:millId/summary')
  getSummary(@Param('millId') millId: string) {
    return this.riceMill.getSummary(millId);
  }
}
