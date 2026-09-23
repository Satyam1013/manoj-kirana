import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Mill, MillSchema } from './schemas/mill.schema';
import { IntakeEntry, IntakeEntrySchema } from './schemas/intake-entry.schema';
import { OutputEntry, OutputEntrySchema } from './schemas/output-entry.schema';
import { RiceMillService } from './rice-mill.service';
import { RiceMillController } from './rice-mill.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Mill.name, schema: MillSchema },
      { name: IntakeEntry.name, schema: IntakeEntrySchema },
      { name: OutputEntry.name, schema: OutputEntrySchema },
    ]),
  ],
  controllers: [RiceMillController],
  providers: [RiceMillService],
})
export class RiceMillModule {}
