import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface ServiceCardProps {
  title: string
  providerName: string
  price: number
  rating: number
  reviewCount: number
  category: string
}

export function ServiceCard({ title, providerName, price, rating, reviewCount, category }: ServiceCardProps) {
  return (
    <div className="flex flex-col border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 min-h-[160px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="secondary" className="mb-2">
            {category}
          </Badge>
          <h3 className="font-semibold text-slate-900 leading-tight block">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{providerName}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-sm font-medium text-slate-900">${price.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-auto pt-4 flex items-center justify-between">
        <div className="flex items-center space-x-1 text-slate-700">
          <Star className="h-4 w-4 fill-slate-900 stroke-none" />
          <span className="text-sm font-medium">{rating.toFixed(1)}</span>
          <span className="text-xs text-slate-400">({reviewCount})</span>
        </div>
        
        <Button size="sm" className="h-8">Hire Now</Button>
      </div>
    </div>
  )
}
