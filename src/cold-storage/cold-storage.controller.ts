import {
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
import { ColdStorageService } from './cold-storage.service';
import { CreateStoreDto } from './dto/store.dto';
import { CreateInEntryDto, CreateOutEntryDto } from './dto/entry.dto';
import { CreateRentPaymentDto } from './dto/rent-payment.dto';

@UseGuards(JwtAuthGuard)
@Controller('cold-storage')
export class ColdStorageController {
  constructor(private cold: ColdStorageService) {}

  /* stores */
  @Get('stores')
  listStores(@Query('search') search?: string): Promise<any[]> {
    return this.cold.listStores(search);
  }

  @Get('stores/:id')
  getStore(@Param('id') id: string) {
    return this.cold.getStore(id);
  }

  @Post('stores')
  createStore(@Body() dto: CreateStoreDto) {
    return this.cold.createStore(dto);
  }

  @Delete('stores/:id')
  deleteStore(@Param('id') id: string) {
    return this.cold.deleteStore(id);
  }

  /* entries */
  @Get('stores/:storeId/entries')
  listEntries(
    @Param('storeId') storeId: string,
    @Query('mode') mode?: 'in' | 'out',
    @Query('search') search?: string,
  ) {
    return this.cold.listEntries(storeId, mode, search);
  }

  @Get('stores/:storeId/lot-numbers')
  listLotNumbers(@Param('storeId') storeId: string) {
    return this.cold.listLotNumbers(storeId);
  }

  @Post('entries/in')
  createInEntry(@Body() dto: CreateInEntryDto) {
    return this.cold.createInEntry(dto);
  }

  @Post('entries/out')
  createOutEntry(@Body() dto: CreateOutEntryDto) {
    return this.cold.createOutEntry(dto);
  }

  @Delete('entries/:id')
  deleteEntry(@Param('id') id: string) {
    return this.cold.deleteEntry(id);
  }

  /* rent payments */
  @Get('stores/:storeId/rent-payments')
  listRentPayments(
    @Param('storeId') storeId: string,
    @Query('search') search?: string,
  ) {
    return this.cold.listRentPayments(storeId, search);
  }

  @Post('rent-payments')
  createRentPayment(@Body() dto: CreateRentPaymentDto) {
    return this.cold.createRentPayment(dto);
  }
}
