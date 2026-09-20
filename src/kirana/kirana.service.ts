import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { Entry, EntryDocument } from './schemas/entry.schema';
import { InventoryItem, InventoryItemDocument } from './schemas/inventory-item.schema';
import { Bill, BillDocument } from './schemas/bill.schema';
import { Receipt, ReceiptDocument } from './schemas/receipt.schema';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { CreateEntryDto } from './dto/entry.dto';
import { AdjustStockDto, CreateInventoryItemDto } from './dto/inventory.dto';
import { CreateBillDto } from './dto/bill.dto';
import { CreateReceiptDto } from './dto/receipt.dto';

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

@Injectable()
export class KiranaService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<CustomerDocument>,
    @InjectModel(Entry.name) private entryModel: Model<EntryDocument>,
    @InjectModel(InventoryItem.name)
    private inventoryModel: Model<InventoryItemDocument>,
    @InjectModel(Bill.name) private billModel: Model<BillDocument>,
    @InjectModel(Receipt.name) private receiptModel: Model<ReceiptDocument>,
  ) {}

  /* ---------------- customers ---------------- */

  async listCustomers(search?: string): Promise<any[]> {
    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { village: { $regex: search, $options: 'i' } },
          ],
        }
      : {};
    const customers = await this.customerModel.find(filter).sort({ name: 1 }).lean();
    const withBalance = await Promise.all(
      customers.map(async (c) => ({ ...c, balance: await this.customerBalance(c._id) })),
    );
    return withBalance;
  }

  async getCustomer(id: string): Promise<any> {
    const cust = await this.customerModel.findById(id).lean();
    if (!cust) throw new NotFoundException('Customer not found');
    const balance = await this.customerBalance(cust._id);
    return { ...cust, balance };
  }

  createCustomer(dto: CreateCustomerDto) {
    return this.customerModel.create(dto);
  }

  async updateCustomer(id: string, dto: UpdateCustomerDto) {
    const cust = await this.customerModel.findByIdAndUpdate(id, dto, { new: true });
    if (!cust) throw new NotFoundException('Customer not found');
    return cust;
  }

  async deleteCustomer(id: string) {
    const balance = await this.customerBalance(new Types.ObjectId(id));
    if (balance !== 0) {
      throw new BadRequestException(
        'Cannot delete a customer with an outstanding balance',
      );
    }
    await this.entryModel.deleteMany({ customerId: id });
    const res = await this.customerModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Customer not found');
    return { deleted: true };
  }

  async customerBalance(customerId: Types.ObjectId | string) {
    const entries = await this.entryModel.find({ customerId }).lean();
    return entries.reduce(
      (sum, e) => sum + (e.type === 'debit' ? e.amount : -e.amount),
      0,
    );
  }

  /* ---------------- ledger entries ---------------- */

  async findOrCreateCustomer(name: string, village?: string) {
    let cust = await this.customerModel.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    });
    if (!cust) {
      cust = await this.customerModel.create({ name: name.trim(), village });
    } else if (village && !cust.village) {
      cust.village = village;
      await cust.save();
    }
    return cust;
  }

  async listEntries(customerId?: string) {
    const filter = customerId ? { customerId } : {};
    return this.entryModel.find(filter).sort({ date: -1, createdAt: -1 }).lean();
  }

  async createEntry(dto: CreateEntryDto) {
    let customer: CustomerDocument;
    if (dto.customerId) {
      customer = await this.customerModel.findById(dto.customerId);
      if (!customer) throw new NotFoundException('Customer not found');
    } else {
      customer = await this.findOrCreateCustomer(dto.customerName, dto.village);
    }

    const entry = await this.entryModel.create({
      customerId: customer._id,
      date: dto.date || todayStr(),
      itemName: dto.itemName,
      qty: dto.qty,
      amount: dto.amount,
      village: dto.village || customer.village,
      type: dto.type,
    });

    if (dto.generateDoc) {
      await this.generateDocForEntry(entry, customer, dto.phone);
    }

    return entry;
  }

  async deleteEntry(id: string) {
    const res = await this.entryModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Entry not found');
    return { deleted: true };
  }

  // Mirrors the frontend's handleEntryDoc: generate a bill (debit) or
  // receipt (credit) for an entry that doesn't have one yet.
  async generateDocForExistingEntry(entryId: string, phone?: string) {
    const entry = await this.entryModel.findById(entryId);
    if (!entry) throw new NotFoundException('Entry not found');
    if (entry.docId) {
      return entry.docType === 'bill'
        ? this.billModel.findById(entry.docId)
        : this.receiptModel.findById(entry.docId);
    }
    const customer = await this.customerModel.findById(entry.customerId);
    return this.generateDocForEntry(entry, customer, phone);
  }

  private async generateDocForEntry(
    entry: EntryDocument,
    customer: CustomerDocument,
    phone?: string,
  ) {
    if (entry.type === 'debit') {
      const billNo = await this.nextBillNo();
      const bill = await this.billModel.create({
        billNo,
        date: entry.date,
        customerName: customer.name,
        village: entry.village || customer.village,
        phone,
        items: [
          {
            name: entry.itemName,
            qty: entry.qty,
            rate: entry.qty ? entry.amount / entry.qty : entry.amount,
            amount: entry.amount,
          },
        ],
        total: entry.amount,
        autoLedger: false, // ledger entry already exists
      });
      entry.docId = bill._id;
      entry.docType = 'bill';
      await entry.save();
      return bill;
    } else {
      const receiptNo = await this.nextReceiptNo();
      const receipt = await this.receiptModel.create({
        receiptNo,
        date: entry.date,
        customerName: customer.name,
        village: entry.village || customer.village,
        amount: entry.amount,
      });
      entry.docId = receipt._id;
      entry.docType = 'receipt';
      await entry.save();
      return receipt;
    }
  }

  /* ---------------- inventory ---------------- */

  listInventory() {
    return this.inventoryModel.find().sort({ name: 1 });
  }

  createInventoryItem(dto: CreateInventoryItemDto) {
    return this.inventoryModel.create({
      name: dto.name,
      unit: dto.unit || 'unit',
      qty: dto.qty || 0,
      price: dto.price || 0,
    });
  }

  async adjustStock(id: string, dto: AdjustStockDto) {
    const item = await this.inventoryModel.findById(id);
    if (!item) throw new NotFoundException('Inventory item not found');
    item.qty =
      dto.mode === 'add' ? item.qty + dto.qty : Math.max(0, item.qty - dto.qty);
    if (dto.price !== undefined) item.price = dto.price;
    await item.save();
    return item;
  }

  async deleteInventoryItem(id: string) {
    const res = await this.inventoryModel.findByIdAndDelete(id);
    if (!res) throw new NotFoundException('Inventory item not found');
    return { deleted: true };
  }

  /* ---------------- bills ---------------- */

  private async nextBillNo() {
    const count = await this.billModel.countDocuments();
    return 'INV-' + String(count + 1).padStart(4, '0');
  }

  private async nextReceiptNo() {
    const count = await this.receiptModel.countDocuments();
    return 'RCPT-' + String(count + 1).padStart(4, '0');
  }

  listBills() {
    return this.billModel.find().sort({ createdAt: -1 });
  }

  async getBill(id: string) {
    const bill = await this.billModel.findById(id);
    if (!bill) throw new NotFoundException('Bill not found');
    return bill;
  }

  async createBill(dto: CreateBillDto) {
    const items = dto.items
      .filter((it) => it.name.trim() && it.qty > 0 && it.rate >= 0)
      .map((it) => ({
        name: it.name.trim(),
        qty: it.qty,
        rate: it.rate,
        amount: it.qty * it.rate,
      }));
    if (!items.length) throw new BadRequestException('At least one valid item is required');

    const total = items.reduce((s, it) => s + it.amount, 0);
    const billNo = await this.nextBillNo();
    const autoLedger = dto.autoLedger !== false;

    const bill = await this.billModel.create({
      billNo,
      date: dto.date || todayStr(),
      customerName: dto.customerName.trim(),
      village: (dto.village || '').trim(),
      phone: (dto.phone || '').trim(),
      items,
      total,
      autoLedger,
    });

    if (autoLedger) {
      const customer = await this.findOrCreateCustomer(bill.customerName, bill.village);
      const summary = items.map((it) => it.name).join(', ');
      const totalQty = items.reduce((s, it) => s + it.qty, 0);
      await this.entryModel.create({
        customerId: customer._id,
        date: bill.date,
        itemName: summary,
        qty: totalQty,
        amount: total,
        village: bill.village,
        type: 'debit',
        docId: bill._id,
        docType: 'bill',
      });
    }

    // Deduct sold quantities from matching inventory items.
    for (const it of items) {
      await this.inventoryModel.findOneAndUpdate(
        { name: { $regex: `^${it.name}$`, $options: 'i' } },
        { $inc: { qty: -it.qty } },
      );
    }
    await this.inventoryModel.updateMany({ qty: { $lt: 0 } }, { qty: 0 });

    return bill;
  }

  /* ---------------- receipts ---------------- */

  listReceipts() {
    return this.receiptModel.find().sort({ createdAt: -1 });
  }

  async getReceipt(id: string) {
    const receipt = await this.receiptModel.findById(id);
    if (!receipt) throw new NotFoundException('Receipt not found');
    return receipt;
  }

  async createReceipt(dto: CreateReceiptDto) {
    const receiptNo = await this.nextReceiptNo();
    return this.receiptModel.create({
      receiptNo,
      date: dto.date || todayStr(),
      customerName: dto.customerName.trim(),
      village: (dto.village || '').trim(),
      amount: dto.amount,
    });
  }
}
