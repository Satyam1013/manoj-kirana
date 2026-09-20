import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schemas/customer.schema';
import { Entry, EntrySchema } from './schemas/entry.schema';
import { InventoryItem, InventoryItemSchema } from './schemas/inventory-item.schema';
import { Bill, BillSchema } from './schemas/bill.schema';
import { Receipt, ReceiptSchema } from './schemas/receipt.schema';
import { KiranaService } from './kirana.service';
import { KiranaController } from './kirana.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: Entry.name, schema: EntrySchema },
      { name: InventoryItem.name, schema: InventoryItemSchema },
      { name: Bill.name, schema: BillSchema },
      { name: Receipt.name, schema: ReceiptSchema },
    ]),
  ],
  controllers: [KiranaController],
  providers: [KiranaService],
})
export class KiranaModule {}
