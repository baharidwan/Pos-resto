
import { Order, SystemConfig } from '../types';

/**
 * LuminaPOS Printer Service
 * Menggunakan Web Bluetooth API untuk mencetak langsung ke printer thermal ESC/POS
 */

// Added local interfaces to fix compilation errors for Web Bluetooth API
interface BluetoothDevice {
  gatt?: BluetoothRemoteGATTServer;
}

interface BluetoothRemoteGATTServer {
  connect(): Promise<BluetoothRemoteGATTServer>;
  getPrimaryService(service: string | number): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string | number): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue(value: BufferSource): Promise<void>;
}

class PrinterService {
  // Use defined interfaces for device and characteristic to fix missing type errors
  private device: BluetoothDevice | null = null;
  private characteristic: BluetoothRemoteGATTCharacteristic | null = null;

  // UUID Standar untuk Printer Bluetooth Thermal
  private PRINTER_SERVICE_UUID = '000018f0-0000-1000-8000-00805f9b34fb';
  private PRINTER_CHARACTERISTIC_UUID = '00002af1-0000-1000-8000-00805f9b34fb';

  async connect(): Promise<boolean> {
    try {
      // Jika sudah terhubung, tidak perlu minta lagi
      if (this.characteristic) return true;

      // Fixed: Access navigator.bluetooth via type assertion to fix missing property error
      this.device = await (navigator as any).bluetooth.requestDevice({
        filters: [{ services: [this.PRINTER_SERVICE_UUID] }],
        optionalServices: [this.PRINTER_SERVICE_UUID]
      });

      const server = await this.device?.gatt?.connect();
      const service = await server?.getPrimaryService(this.PRINTER_SERVICE_UUID);
      this.characteristic = (await service?.getCharacteristic(this.PRINTER_CHARACTERISTIC_UUID)) || null;

      return !!this.characteristic;
    } catch (error) {
      console.error('Bluetooth Connection Error:', error);
      return false;
    }
  }

  private async sendRaw(data: Uint8Array) {
    if (!this.characteristic) throw new Error('Printer tidak terhubung');
    
    // Printer thermal biasanya punya buffer terbatas, kirim dalam chunk kecil (20 bytes)
    const chunkSize = 20;
    for (let i = 0; i < data.length; i += chunkSize) {
      const chunk = data.slice(i, i + chunkSize);
      await this.characteristic.writeValue(chunk);
    }
  }

  // Perintah ESC/POS Sederhana
  private encoder = new TextEncoder();
  private ESC = 0x1B;
  private GS = 0x1D;

  async printOrder(order: Order, config: SystemConfig, isChecker: boolean = false) {
    if (!await this.connect()) throw new Error('Gagal menghubungkan printer');

    const commands: number[] = [];

    // 1. Initialize Printer
    commands.push(this.ESC, 0x40);

    // 2. Alignment Center
    commands.push(this.ESC, 0x61, 0x01);

    if (isChecker) {
      // Header Checker (Bold & Double Height)
      commands.push(this.ESC, 0x21, 0x10);
      commands.push(...Array.from(this.encoder.encode('ORDER CHECKER\n')));
      commands.push(this.ESC, 0x21, 0x00);
    } else {
      // Header Toko
      commands.push(this.ESC, 0x21, 0x08); // Bold
      commands.push(...Array.from(this.encoder.encode(`${config.storeName}\n`)));
      commands.push(this.ESC, 0x21, 0x00);
      commands.push(...Array.from(this.encoder.encode(`${config.address}\n`)));
    }
    
    commands.push(...Array.from(this.encoder.encode('--------------------------------\n')));

    // 3. Info Order (Left)
    commands.push(this.ESC, 0x61, 0x00);
    commands.push(...Array.from(this.encoder.encode(`ID: ${order.id}\n`)));
    commands.push(...Array.from(this.encoder.encode(`Nama: ${order.customerName}\n`)));
    commands.push(...Array.from(this.encoder.encode(`Meja: ${order.tableNumber}\n`)));
    commands.push(...Array.from(this.encoder.encode(`Waktu: ${new Date(order.timestamp).toLocaleString()}\n`)));
    commands.push(...Array.from(this.encoder.encode('--------------------------------\n')));

    // 4. Items
    order.items.forEach(item => {
      // Format: NAMA ITEM (Baris 1)
      commands.push(...Array.from(this.encoder.encode(`${item.name}\n`)));
      // Format: QTY x HARGA       TOTAL (Baris 2)
      const qtyPrice = `${item.quantity} x ${item.price.toLocaleString()}`;
      const total = (item.price * item.quantity).toLocaleString();
      const spaces = 32 - qtyPrice.length - total.length;
      const line = qtyPrice + ' '.repeat(Math.max(1, spaces)) + total;
      commands.push(...Array.from(this.encoder.encode(`${line}\n`)));
    });

    commands.push(...Array.from(this.encoder.encode('--------------------------------\n')));

    if (!isChecker) {
      // 5. Total & Bayar (Right)
      commands.push(this.ESC, 0x61, 0x02);
      const tax = order.total * 0.1;
      const grandTotal = order.total + tax;
      
      commands.push(...Array.from(this.encoder.encode(`Subtotal: Rp ${order.total.toLocaleString()}\n`)));
      commands.push(...Array.from(this.encoder.encode(`PPN (10%): Rp ${tax.toLocaleString()}\n`)));
      
      // Total Bold
      commands.push(this.ESC, 0x21, 0x08);
      commands.push(...Array.from(this.encoder.encode(`TOTAL: Rp ${grandTotal.toLocaleString()}\n`)));
      commands.push(this.ESC, 0x21, 0x00);

      if (order.cashReceived) {
        commands.push(...Array.from(this.encoder.encode(`Tunai: Rp ${order.cashReceived.toLocaleString()}\n`)));
        commands.push(...Array.from(this.encoder.encode(`Kembali: Rp ${order.change?.toLocaleString()}\n`)));
      }
    }

    // 6. Footer
    commands.push(this.ESC, 0x61, 0x01);
    commands.push(0x0A); // Line feed
    commands.push(...Array.from(this.encoder.encode(isChecker ? '--- SELESAI ---\n' : 'Terima Kasih!\n')));
    commands.push(0x0A, 0x0A, 0x0A, 0x0A); // Margin bawah agar bisa disobek

    // 7. Cut Paper (jika didukung)
    commands.push(this.GS, 0x56, 0x41, 0x00);

    await this.sendRaw(new Uint8Array(commands));
  }
}

export const printerService = new PrinterService();
