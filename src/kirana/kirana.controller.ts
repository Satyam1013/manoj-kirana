import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KiranaService } from './kirana.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CreateEntryDto } from './dto/entry.dto';
import { AdjustStockDto, CreateInventoryItemDto } from './dto/inventory.dto';
import { CreateBillDto } from './dto/bill.dto';
import { CreateReceiptDto } from './dto/receipt.dto';

@UseGuards(JwtAuthGuard)
@Controller('kirana')
export class KiranaController {
  constructor(private kirana: KiranaService) {}

  /* customers */
  @Get('customers')
  listCustomers(@Query('search') search?: string): Promise<any[]> {
    return this.kirana.listCustomers(search);
  }

  @Get('customers/:id')
  getCustomer(@Param('id') id: string): Promise<any> {
    return this.kirana.getCustomer(id);
  }

  @Post('customers')
  createCustomer(@Body() dto: CreateCustomerDto) {
    return this.kirana.createCustomer(dto);
  }

  @Patch('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.kirana.updateCustomer(id, dto);
  }

  @Delete('customers/:id')
  deleteCustomer(@Param('id') id: string) {
    return this.kirana.deleteCustomer(id);
  }

  /* ledger entries */
  @Get('entries')
  listEntries(@Query('customerId') customerId?: string) {
    return this.kirana.listEntries(customerId);
  }

  @Post('entries')
  createEntry(@Body() dto: CreateEntryDto) {
    return this.kirana.createEntry(dto);
  }

  @Delete('entries/:id')
  deleteEntry(@Param('id') id: string) {
    return this.kirana.deleteEntry(id);
  }

  @Post('entries/:id/generate-doc')
  generateDoc(@Param('id') id: string, @Body('phone') phone?: string) {
    return this.kirana.generateDocForExistingEntry(id, phone);
  }

  /* inventory */
  @Get('inventory')
  listInventory() {
    return this.kirana.listInventory();
  }

  @Post('inventory')
  createInventoryItem(@Body() dto: CreateInventoryItemDto) {
    return this.kirana.createInventoryItem(dto);
  }

  @Patch('inventory/:id/adjust')
  adjustStock(@Param('id') id: string, @Body() dto: AdjustStockDto) {
    return this.kirana.adjustStock(id, dto);
  }

  @Delete('inventory/:id')
  deleteInventoryItem(@Param('id') id: string) {
    return this.kirana.deleteInventoryItem(id);
  }

  /* bills */
  @Get('bills')
  listBills() {
    return this.kirana.listBills();
  }

  @Get('bills/:id')
  getBill(@Param('id') id: string) {
    return this.kirana.getBill(id);
  }

  @Post('bills')
  createBill(@Body() dto: CreateBillDto) {
    return this.kirana.createBill(dto);
  }

  /* receipts */
  @Get('receipts')
  listReceipts() {
    return this.kirana.listReceipts();
  }

  @Get('receipts/:id')
  getReceipt(@Param('id') id: string) {
    return this.kirana.getReceipt(id);
  }

  @Post('receipts')
  createReceipt(@Body() dto: CreateReceiptDto) {
    return this.kirana.createReceipt(dto);
  }
}
