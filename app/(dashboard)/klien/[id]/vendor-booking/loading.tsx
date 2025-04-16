import { Skeleton } from "@/components/ui/skeleton"

export default function BookVendorLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Skeleton className="h-10 w-10 mr-2" />
        <div>
          <Skeleton className="h-8 w-48 mb-1" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[600px] w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    </div>
  )
}
