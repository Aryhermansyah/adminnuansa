"use client"

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react"
import { dbService } from "@/lib/db/db-service"
import type { Client, Event, TeamMember, Vendor, VendorBooking, BaseModel } from "@/lib/db/db-service"
import { unstable_batchedUpdates } from "react-dom"

interface DataContextType {
  clients: Client[]
  events: Event[]
  team: TeamMember[]
  vendors: Vendor[]
  vendorBookings: VendorBooking[]
  refreshData: (forceRefresh?: boolean) => Promise<void>
  isLoading: boolean
  error: Error | null
  addClient: (client: Omit<Client, "id" | "createdAt" | "updatedAt">) => Promise<number>
  addTeamMember: (member: Omit<TeamMember, "id" | "createdAt" | "updatedAt">) => Promise<number>
  addVendor: (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">) => Promise<number>
  addEvent: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => Promise<number>
  addVendorBooking: (booking: Omit<VendorBooking, "id" | "createdAt" | "updatedAt">) => Promise<number>
  deleteEvent: (id: number) => Promise<void>
  deleteVendorBooking: (id: number) => Promise<void>
}

const DataContext = createContext<DataContextType>({
  clients: [],
  events: [],
  team: [],
  vendors: [],
  vendorBookings: [],
  refreshData: async (_forceRefresh?: boolean) => {},
  isLoading: true,
  error: null,
  addClient: async () => 0,
  addTeamMember: async () => 0,
  addVendor: async () => 0,
  addEvent: async () => 0,
  addVendorBooking: async () => 0,
  deleteEvent: async () => {},
  deleteVendorBooking: async () => {},
})

// Cache untuk menyimpan hasil query
let dataCache: {[key: string]: any} = {}
const CACHE_EXPIRY = 5 * 60 * 1000 // 5 menit dalam milliseconds
let cacheTimestamp = Date.now()

export function DataProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorBookings, setVendorBookings] = useState<VendorBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCacheStale, setIsCacheStale] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Cache buster function
  const invalidateCache = useCallback(() => {
    dataCache = {}
    cacheTimestamp = Date.now()
    setIsCacheStale(true)
  }, [])

  // Custom function untuk mendapatkan data dengan caching
  const getCachedData = useCallback(async <T extends BaseModel>(storeName: string): Promise<T[]> => {
    // Periksa apakah cache masih valid
    const isCacheValid = dataCache[storeName] && 
                         Date.now() - cacheTimestamp < CACHE_EXPIRY;
    
    if (isCacheValid) {
      console.log(`Using cached data for ${storeName}`);
      return dataCache[storeName] as T[];
    }

    console.log(`Fetching fresh data for ${storeName}`);
    try {
      const data = await dbService.getAll<T>(storeName as any);
      // Update cache
      dataCache[storeName] = data;
      cacheTimestamp = Date.now();
      return data;
    } catch (error) {
      console.error(`Error fetching ${storeName}:`, error);
      return [];
    }
  }, [])

  // Implementasi debounce untuk mencegah multiple refresh
  const debouncedRefresh = useCallback((fn: Function) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        fn(...args);
        timeout = null;
      }, 300); // 300ms debounce
    };
  }, []);
  
  const refreshData = useCallback(async (forceRefresh = false) => {
    // Jika data cache masih valid dan tidak ada force refresh, gunakan cache
    if (!forceRefresh && !isCacheStale && Object.keys(dataCache).length > 0) {
      console.log("Using cached data for all stores");
      
      // Batch update state untuk menghindari multiple renders
      unstable_batchedUpdates(() => {
        setClients(dataCache['clients'] || []);
        setEvents(dataCache['events'] || []);
        setTeam(dataCache['team'] || []);
        setVendors(dataCache['vendors'] || []);
        setVendorBookings(dataCache['vendorBookings'] || []);
        setIsLoading(false);
      });
      
      return;
    }

    try {
      setIsLoading(true);
      setError(null); // Reset error state
      
      // Log sekali dan hapus log berulang yang tidak perlu
      if (forceRefresh) {
        console.log("Force refreshing all data...");
      }
      
      // Reset cache - lakukan shallow copy untuk menghindari reference issues
      dataCache = {};
      cacheTimestamp = Date.now();
      
      // Gunakan AbortController untuk menangani race conditions
      const controller = new AbortController();
      const signal = controller.signal;
      
      try {
        // Ambil data secara paralel dengan timeout
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Data fetch timeout')), 10000)
        );
        
        const dataPromise = Promise.all([
          dbService.getAll<Client>("clients"),
          dbService.getAll<Event>("events"),
          dbService.getAll<TeamMember>("team"),
          dbService.getAll<Vendor>("vendors"),
          dbService.getAll<VendorBooking>("vendorBookings")
        ]);
        
        // Race untuk mengatasi timeout
        const [newClients, newEvents, newTeam, newVendors, newVendorBookings] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [Client[], Event[], TeamMember[], Vendor[], VendorBooking[]];
        
        // Performance optimization: hanya perbarui jika data benar-benar berubah
        const hasChanged = (
          !dataCache['clients'] || JSON.stringify(dataCache['clients']) !== JSON.stringify(newClients) ||
          !dataCache['events'] || JSON.stringify(dataCache['events']) !== JSON.stringify(newEvents) ||
          !dataCache['team'] || JSON.stringify(dataCache['team']) !== JSON.stringify(newTeam) ||
          !dataCache['vendors'] || JSON.stringify(dataCache['vendors']) !== JSON.stringify(newVendors) ||
          !dataCache['vendorBookings'] || JSON.stringify(dataCache['vendorBookings']) !== JSON.stringify(newVendorBookings)
        );
        
        if (hasChanged) {
          // Perbarui cache
          dataCache['clients'] = newClients;
          dataCache['events'] = newEvents;
          dataCache['team'] = newTeam;
          dataCache['vendors'] = newVendors;
          dataCache['vendorBookings'] = newVendorBookings;
          
          // Batch update state untuk menghindari multiple renders
          unstable_batchedUpdates(() => {
            setClients(newClients);
            setEvents(newEvents);
            setTeam(newTeam);
            setVendors(newVendors);
            setVendorBookings(newVendorBookings);
            setIsCacheStale(false);
          });
        } else {
          console.log("Data unchanged, skipping re-render");
        }
      } catch (fetchError) {
        console.error("Error fetching data:", fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
        controller.abort();
      }
    } catch (error) {
      console.error("Error in refresh data:", error);
      setError(error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsLoading(false);
    }
  }, [isCacheStale])

  const addClient = useCallback(async (client: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<number> => {
    const id = await dbService.add<Client>("clients", client as Client)
    invalidateCache()
      await refreshData()
      return id
  }, [invalidateCache, refreshData])

  const addTeamMember = useCallback(async (member: Omit<TeamMember, "id" | "createdAt" | "updatedAt">): Promise<number> => {
    const id = await dbService.add<TeamMember>("team", member as TeamMember)
    invalidateCache()
      await refreshData()
      return id
  }, [invalidateCache, refreshData])

  const addVendor = useCallback(async (vendor: Omit<Vendor, "id" | "createdAt" | "updatedAt">): Promise<number> => {
    const id = await dbService.add<Vendor>("vendors", vendor as Vendor)
    invalidateCache()
      await refreshData()
      return id
  }, [invalidateCache, refreshData])

  const addEvent = useCallback(async (event: Omit<Event, "id" | "createdAt" | "updatedAt">): Promise<number> => {
    const id = await dbService.add<Event>("events", event as Event)
    invalidateCache()
      await refreshData()
      return id
  }, [invalidateCache, refreshData])

  const addVendorBooking = useCallback(async (booking: Omit<VendorBooking, "id" | "createdAt" | "updatedAt">): Promise<number> => {
    const id = await dbService.add<VendorBooking>("vendorBookings", booking as VendorBooking)
    invalidateCache()
      await refreshData()
      return id
  }, [invalidateCache, refreshData])

  const deleteEvent = useCallback(async (id: number): Promise<void> => {
    await dbService.delete("events", id)
    invalidateCache()
    await refreshData()
  }, [invalidateCache, refreshData])

  const deleteVendorBooking = useCallback(async (id: number): Promise<void> => {
    await dbService.delete("vendorBookings", id)
    invalidateCache()
    await refreshData()
  }, [invalidateCache, refreshData])

  useEffect(() => {
    refreshData()
    
    // Atur interval untuk invalidate cache secara berkala (opsional)
    const intervalId = setInterval(() => {
      setIsCacheStale(true);
    }, CACHE_EXPIRY);
    
    return () => clearInterval(intervalId);
  }, [])

  // Memoize context value untuk menghindari re-render yang tidak perlu
  const contextValue = useMemo(() => ({
    clients,
    events,
    team,
    vendors,
    vendorBookings,
    refreshData,
    isLoading,
    error,
    addClient,
    addTeamMember,
    addVendor,
    addEvent,
    addVendorBooking,
    deleteEvent,
    deleteVendorBooking,
  }), [clients, events, team, vendors, vendorBookings, isLoading, error, deleteEvent, deleteVendorBooking]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

export const useData = () => useContext(DataContext)
