import { openDB, type DBSchema, type IDBPDatabase } from "idb"

// Define the database schema
interface NuansaWeddingDB extends DBSchema {
  clients: {
    key: number
    value: Client
    indexes: { "by-name": string }
  }
  events: {
    key: number
    value: Event
    indexes: { "by-date": string; "by-client": number }
  }
  team: {
    key: number
    value: TeamMember
    indexes: { "by-role": string }
  }
  vendors: {
    key: number
    value: Vendor
    indexes: { "by-category": string }
  }
  attendance: {
    key: number
    value: Attendance
    indexes: { "by-date": string; "by-team-member": number }
  }
  finances: {
    key: number
    value: Finance
    indexes: { "by-date": string; "by-type": string }
  }
  vendorBookings: {
    key: number
    value: VendorBooking
    indexes: { "by-client": number; "by-vendor": number; "by-date": string }
  }
}

// Define the data models
export interface BaseModel {
  id?: number
  createdAt: string
  updatedAt: string
}

export interface Client extends BaseModel {
  name: string
  phone: string
  email?: string
  address: string
  eventType: string
  eventDate: string
  location: string
  services: string[]
  status: string
  notes?: string
  budget?: string
  referenceSource?: string
  palette?: string[]
  attirePhotos?: string[]
  moodboards?: string[]
}

export interface Event extends BaseModel {
  clientId: number
  clientName: string
  eventDate: string
  time: string
  location: string
  type: "Pernikahan" | "Prewedding" | "Engagement" | "Lamaran" | string
  services: string[]
  team?: string[]
  vendors?: string[]
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  budget?: number
  paymentStatus?: "unpaid" | "partial" | "paid"
  paymentAmount?: number
  paymentDate?: string
}

export interface Task {
  id: number
  title: string
  assignedTo: string
  time: string
  completed: boolean
}

export interface TeamMember extends BaseModel {
  name: string
  role: string
  status: string
  phone: string
  email?: string
  address: string
  joinDate: string
  skills: string[]
  notes?: string
  avatar?: string
  bankAccount?: {
    bank: string
    accountNumber: string
    accountName: string
  }
}

export interface Vendor extends BaseModel {
  name: string
  category: string
  phone: string
  email?: string
  address: string
  price: number
  description?: string
  services: string[]
  notes?: string
  portfolio?: string[]
  bankAccount?: {
    bank: string
    accountNumber: string
    accountName: string
  }
}

export interface Attendance extends BaseModel {
  teamMemberId: number
  name: string
  role: string
  date: string
  checkIn: string
  checkOut: string
  location: string
  status: string
  photo?: string
}

export interface Finance extends BaseModel {
  type: "revenue" | "expense"
  date: string
  amount: number
  description: string
  category: string
  relatedId?: number // Client ID or Team Member ID
  relatedName?: string
  status: string
}

export interface VendorBooking extends BaseModel {
  clientId: number
  clientName: string
  vendorId: number
  vendorName: string
  vendorCategory: string
  eventDate: string
  bookingDate: string
  price: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  notes?: string
  paymentStatus: "unpaid" | "partial" | "paid"
  paymentAmount?: number
  paymentDate?: string
}

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined" && typeof window.indexedDB !== "undefined"

export type StoreNames = keyof NuansaWeddingDB

// Database service class
export class DBService {
  private dbPromise: Promise<IDBPDatabase<NuansaWeddingDB>> | null = null
  private static instance: DBService

  private constructor() {
    // Only initialize IndexedDB in browser environments
    if (isBrowser) {
      try {
        this.dbPromise = openDB<NuansaWeddingDB>("nuansa-wedding-db", 3, {
          upgrade(db, oldVersion, newVersion) {
            console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
            
            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains("clients")) {
              const clientStore = db.createObjectStore("clients", { keyPath: "id", autoIncrement: true })
              clientStore.createIndex("by-name", "name")
              console.log("Created clients store");
            }

            if (!db.objectStoreNames.contains("events")) {
              const eventStore = db.createObjectStore("events", { keyPath: "id", autoIncrement: true })
              eventStore.createIndex("by-date", "date")
              eventStore.createIndex("by-client", "clientId")
              console.log("Created events store");
            }

            if (!db.objectStoreNames.contains("team")) {
              const teamStore = db.createObjectStore("team", { keyPath: "id", autoIncrement: true })
              teamStore.createIndex("by-role", "role")
              console.log("Created team store");
            }

            if (!db.objectStoreNames.contains("vendors")) {
              const vendorStore = db.createObjectStore("vendors", { keyPath: "id", autoIncrement: true })
              vendorStore.createIndex("by-category", "category")
              console.log("Created vendors store");
            }

            if (!db.objectStoreNames.contains("attendance")) {
              const attendanceStore = db.createObjectStore("attendance", { keyPath: "id", autoIncrement: true })
              attendanceStore.createIndex("by-date", "date")
              attendanceStore.createIndex("by-team-member", "teamMemberId")
              console.log("Created attendance store");
            }

            if (!db.objectStoreNames.contains("finances")) {
              const financeStore = db.createObjectStore("finances", { keyPath: "id", autoIncrement: true })
              financeStore.createIndex("by-date", "date")
              financeStore.createIndex("by-type", "type")
              console.log("Created finances store");
            }

            // Add vendorBookings store in version 2 or higher
            if (oldVersion < 2 && !db.objectStoreNames.contains("vendorBookings")) {
              const vendorBookingsStore = db.createObjectStore("vendorBookings", { keyPath: "id", autoIncrement: true })
              vendorBookingsStore.createIndex("by-client", "clientId")
              vendorBookingsStore.createIndex("by-vendor", "vendorId")
              vendorBookingsStore.createIndex("by-date", "eventDate")
              console.log("Created vendorBookings store");
            }
            
            // Additional upgrades for version 3
            if (oldVersion < 3) {
              console.log("Performing version 3 upgrades");
              // Add any version 3 specific upgrades here if needed
            }
          }
        });
      } catch (error) {
        console.error("Error initializing database:", error);
        // Fallback untuk development - mencoba membuat objek kosong yang tersedia
        if (typeof window !== 'undefined') {
          window.alert('Database error: ' + (error instanceof Error ? error.message : String(error)));
        }
      }
    }
  }

  // Singleton pattern
  public static getInstance(): DBService {
    if (!DBService.instance) {
      DBService.instance = new DBService()
    }
    return DBService.instance
  }

  // Check if we're in a browser environment
  private checkBrowser(): void {
    if (!isBrowser) {
      throw new Error("IndexedDB is only available in browser environments")
    }

    if (!this.dbPromise) {
      throw new Error("Database has not been initialized")
    }
  }

  // Add this function to check if database is ready
  async isDatabaseReady(): Promise<boolean> {
    if (!isBrowser) return false

    try {
      const db = await this.dbPromise!
      return !!db
    } catch (error) {
      console.error("Database is not ready:", error)
      return false
    }
  }

  // Generic CRUD operations
  async getAll<T extends BaseModel>(storeName: StoreNames): Promise<T[]> {
    if (!isBrowser) return []
    this.checkBrowser()
    const db = await this.dbPromise!
    const result = await db.getAll(storeName as any)
    return result as unknown as T[]
  }

  async getById<T extends BaseModel>(storeName: StoreNames, id: number): Promise<T | undefined> {
    if (!isBrowser) return undefined
    this.checkBrowser()
    const db = await this.dbPromise!
    const result = await db.get(storeName as any, id as IDBValidKey)
    return result as unknown as T | undefined
  }

  async add<T extends BaseModel>(storeName: StoreNames, item: T): Promise<number> {
    try {
      if (!isBrowser) return -1;
      
      if (!this.dbPromise) {
        console.error("Database not initialized");
        return -1;
      }
      
      const db = await this.dbPromise;
      const timestamp = this.getCurrentTimestamp();

      // Pastikan objek memiliki timestamp
      const itemToAdd = {
        ...item,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      
      // Hapus ID jika undefined agar auto-increment berfungsi
      if (itemToAdd.id === undefined) {
        delete itemToAdd.id;
      }
      
      try {
        // Tambahkan data ke store
        const id = await db.add(storeName as any, itemToAdd as any);
        console.log(`Added item to ${storeName} with ID:`, id);
        return typeof id === 'number' ? id : parseInt(String(id), 10) || -1;
      } catch (dbError) {
        console.error(`Error adding item to ${storeName}:`, dbError);
        console.error("Item that failed:", itemToAdd);
        return -1;
      }
    } catch (error) {
      console.error("Error in add method:", error);
      return -1;
    }
  }

  async update<T extends BaseModel>(storeName: StoreNames, item: T): Promise<number> {
    this.checkBrowser()
    const db = await this.dbPromise!
    const timestamp = this.getCurrentTimestamp()

    item.updatedAt = timestamp

    return db.put(storeName as any, item as any)
  }

  async delete(storeName: StoreNames, id: number): Promise<void> {
    this.checkBrowser()
    const db = await this.dbPromise!
    await db.delete(storeName as any, id as IDBValidKey)
  }

  // Query by index
  async getByIndex<T extends BaseModel>(
    storeName: StoreNames,
    indexName: string,
    value: IDBKeyRange | any
  ): Promise<T[]> {
    if (!isBrowser) return []
    this.checkBrowser()
    const db = await this.dbPromise!
    const store = db.transaction(storeName as any).store
    const index = store.index(indexName as any)
    const result = await index.getAll(value)
    return result as unknown as T[]
  }

  // Get current timestamp - using local time only to avoid fetch errors
  private getCurrentTimestamp(): string {
    // Return local time directly without trying to fetch from API
    return new Date().toISOString()
  }
}

// Export a singleton instance
export const dbService = DBService.getInstance()
