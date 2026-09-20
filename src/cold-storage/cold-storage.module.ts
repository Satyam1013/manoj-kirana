import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Store, StoreSchema } from './schemas/store.schema';
import { ColdEntry, ColdEntrySchema } from './schemas/entry.schema';
import { RentPayment, RentPaymentSchema } from './schemas/rent-payment.schema';
import { ColdStorageService } from './cold-storage.service';
import { ColdStorageController } from './cold-storage.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Store.name, schema: StoreSchema },
      { name: ColdEntry.name, schema: ColdEntrySchema },
      { name: RentPayment.name, schema: RentPaymentSchema },
    ]),
  ],
  controllers: [ColdStorageController],
  providers: [ColdStorageService],
})
export class ColdStorageModule {}
