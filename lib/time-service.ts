export class TimeService {
  private static instance: TimeService

  private constructor() {}

  // Singleton pattern
  public static getInstance(): TimeService {
    if (!TimeService.instance) {
      TimeService.instance = new TimeService()
    }
    return TimeService.instance
  }

  // Get current timestamp
  public getCurrentTimestamp(): string {
    return new Date().toISOString()
  }

  // Format relative time
  public getRelativeTime(date: string): string {
    const now = new Date()
    const inputDate = new Date(date)
    const diff = now.getTime() - inputDate.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (seconds < 60) {
      return "baru saja"
    } else if (minutes < 60) {
      return `${minutes} menit yang lalu`
    } else if (hours < 24) {
      return `${hours} jam yang lalu`
    } else {
      return `${days} hari yang lalu`
    }
  }

  // Format date
  public formatDate(date: string): string {
    const inputDate = new Date(date)
    return inputDate.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Format time
  public formatTime(date: string): string {
    const inputDate = new Date(date)
    return inputDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Format date and time
  public formatDateTime(date: string): string {
    const inputDate = new Date(date)
    return inputDate.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}

// Export a singleton instance
export const timeService = TimeService.getInstance()
