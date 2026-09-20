import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from './schemas/store.schema';
import { ColdEntry, ColdEntryDocument } from './schemas/entry.schema';
import { RentPayment, RentPaymentDocument } from './schemas/rent-payment.schema';
import { CreateStoreDto } from './dto/store.dto';
import { CreateInEntryDto, CreateOutEntryDto } from './dto/entry.dto';
import { CreateRentPaymentDto } from './dto/rent-payment.dto';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class ColdStorageService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
    @InjectModel(ColdEntry.name) private entryModel: Model<ColdEntryDocument>,
    @InjectModel(RentPayment.name)
    private rentModel: Model<RentPaymentDocument>,
  ) {}

  /* stores */
  async listStores(search?: string): Promise<any[]> {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    const stores = await this.storeModel.find(filter).sort({ name: 1 }).lean();
    return Promise.all(
      stores.map(async (s) => ({
        ...s,
        inCount: await this.entryModel.countDocuments({ storeId: s._id, mode: 'in' }),
        outCount: await this.entryModel.countDocuments({ storeId: s._id, mode: 'out' }),
      })),
    );
  }

  async getStore(id: string) {
    const store = await this.storeModel.findById(id);
    if (!store) throw new NotFoundException('Cold storage not found');
    return store;
  }

  createStore(dto: CreateStoreDto) {
    return this.storeModel.create(dto);
  }

  async deleteStore(id: string) {
    await this.entryModel.deleteMany({ storeId: id });
    await this.rentModel.deleteMany({ storeId: id });
    const res = await this.storeModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Cold storage not found');
    return { deleted: true };
  }

  /* in/out entries */
  async listEntries(storeId: string, mode?: 'in' | 'out', search?: string) {
    const filter: any = { storeId };
    if (mode) filter.mode = mode;
    let entries = await this.entryModel.find(filter).sort({ date: -1, time: -1 }).lean();
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((e) =>
        Object.values(e).join(' ').toLowerCase().includes(q),
      );
    }
    return entries;
  }

  async createInEntry(dto: CreateInEntryDto) {
    await this.assertStore(dto.storeId);
    return this.entryModel.create({
      ...dto,
      mode: 'in',
      date: dto.date || todayStr(),
    });
  }

  async createOutEntry(dto: CreateOutEntryDto) {
    await this.assertStore(dto.storeId);
    return this.entryModel.create({
      ...dto,
      mode: 'out',
      date: dto.date || todayStr(),
    });
  }

  async deleteEntry(id: string) {
    const res = await this.entryModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Entry not found');
    return { deleted: true };
  }

  async listLotNumbers(storeId: string) {
    const entries = await this.entryModel
      .find({ storeId, mode: 'in' })
      .distinct('lotNumber');
    return entries;
  }

  /* rent payments */
  async listRentPayments(storeId: string, search?: string) {
    let rents = await this.rentModel.find({ storeId }).sort({ date: -1 }).lean();
    if (search) {
      const q = search.toLowerCase();
      rents = rents.filter(
        (r) => r.date.toLowerCase().includes(q) || String(r.amount).includes(q),
      );
    }
    const totalRent = rents.reduce((s, r) => s + Number(r.amount), 0);
    return { rents, totalRent };
  }

  async createRentPayment(dto: CreateRentPaymentDto) {
    await this.assertStore(dto.storeId);
    return this.rentModel.create({
      storeId: dto.storeId,
      date: dto.date || todayStr(),
      amount: dto.amount,
    });
  }

  private async assertStore(storeId: string) {
    const store = await this.storeModel.findById(storeId);
    if (!store) throw new NotFoundException('Cold storage not found');
    return store;
  }
}
