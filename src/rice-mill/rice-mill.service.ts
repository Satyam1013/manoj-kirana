import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mill, MillDocument } from './schemas/mill.schema';
import { IntakeEntry, IntakeEntryDocument } from './schemas/intake-entry.schema';
import { OutputEntry, OutputEntryDocument } from './schemas/output-entry.schema';
import { CreateMillDto } from './dto/mill.dto';
import { CreateIntakeEntryDto } from './dto/intake-entry.dto';
import { CreateOutputEntryDto } from './dto/output-entry.dto';

type PartyType = 'private' | 'government';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class RiceMillService {
  constructor(
    @InjectModel(Mill.name) private millModel: Model<MillDocument>,
    @InjectModel(IntakeEntry.name) private intakeModel: Model<IntakeEntryDocument>,
    @InjectModel(OutputEntry.name) private outputModel: Model<OutputEntryDocument>,
  ) {}

  /* mills */
  async listMills(search?: string): Promise<any[]> {
    const filter = search ? { name: { $regex: search, $options: 'i' } } : {};
    const mills = await this.millModel.find(filter).sort({ name: 1 }).lean();
    return Promise.all(
      mills.map(async (m) => ({
        ...m,
        intakeCount: await this.intakeModel.countDocuments({ millId: m._id }),
        outputCount: await this.outputModel.countDocuments({ millId: m._id }),
      })),
    );
  }

  async getMill(id: string) {
    const mill = await this.millModel.findById(id);
    if (!mill) throw new NotFoundException('Rice mill not found');
    return mill;
  }

  createMill(dto: CreateMillDto) {
    return this.millModel.create(dto);
  }

  async deleteMill(id: string) {
    await this.intakeModel.deleteMany({ millId: id });
    await this.outputModel.deleteMany({ millId: id });
    const res = await this.millModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Rice mill not found');
    return { deleted: true };
  }

  /* intake entries (paddy coming in) */
  async listIntakeEntries(millId: string, partyType?: PartyType, search?: string) {
    const filter: any = { millId };
    if (partyType) filter.partyType = partyType;
    let entries = await this.intakeModel.find(filter).sort({ date: -1, time: -1 }).lean();
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((e) =>
        Object.values(e).join(' ').toLowerCase().includes(q),
      );
    }
    return entries;
  }

  async createIntakeEntry(dto: CreateIntakeEntryDto) {
    await this.assertMill(dto.millId);
    return this.intakeModel.create({
      ...dto,
      date: dto.date || todayStr(),
    });
  }

  /* output entries (rice dispatched out) */
  async listOutputEntries(millId: string, partyType?: PartyType, search?: string) {
    const filter: any = { millId };
    if (partyType) filter.partyType = partyType;
    let entries = await this.outputModel.find(filter).sort({ date: -1 }).lean();
    if (search) {
      const q = search.toLowerCase();
      entries = entries.filter((e) =>
        Object.values(e).join(' ').toLowerCase().includes(q),
      );
    }
    return entries;
  }

  async createOutputEntry(dto: CreateOutputEntryDto) {
    await this.assertMill(dto.millId);
    return this.outputModel.create({
      ...dto,
      date: dto.date || todayStr(),
    });
  }

  async deleteEntry(id: string, type: 'intake' | 'output') {
    const res =
      type === 'intake'
        ? await this.intakeModel.findByIdAndDelete(id)
        : await this.outputModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Entry not found');
    return { deleted: true };
  }

  /* summary */
  async getSummary(millId: string) {
    await this.assertMill(millId);
    const intakes = await this.intakeModel.find({ millId }).lean();
    const outputs = await this.outputModel.find({ millId }).lean();

    const intakeTotals = this.totalsByParty(intakes);
    const outputTotals = this.totalsByParty(outputs);
    const totalIntakeWeight = intakeTotals.private.weightKg + intakeTotals.government.weightKg;
    const totalOutputWeight = outputTotals.private.weightKg + outputTotals.government.weightKg;
    const yieldPercent = totalIntakeWeight
      ? (totalOutputWeight / totalIntakeWeight) * 100
      : 0;

    return { intake: intakeTotals, output: outputTotals, yieldPercent };
  }

  private totalsByParty(
    rows: { partyType: PartyType; bagsCount?: string; weightKg?: number }[],
  ): Record<PartyType, { bags: number; weightKg: number }> {
    const byParty: Record<PartyType, { bags: number; weightKg: number }> = {
      private: { bags: 0, weightKg: 0 },
      government: { bags: 0, weightKg: 0 },
    };
    for (const r of rows) {
      byParty[r.partyType].bags += Number(r.bagsCount) || 0;
      byParty[r.partyType].weightKg += Number(r.weightKg) || 0;
    }
    return byParty;
  }

  private async assertMill(millId: string) {
    const mill = await this.millModel.findById(millId);
    if (!mill) throw new NotFoundException('Rice mill not found');
    return mill;
  }
}
