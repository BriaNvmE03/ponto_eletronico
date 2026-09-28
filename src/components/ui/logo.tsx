import { Shield } from "lucide-react"

export function Logo({ className = "", text = "Ponto." }: { className?: string, text?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 shadow-[0_8px_16px_-6px_rgba(220,38,38,0.6)]">
        <Shield className="h-5 w-5 text-white" strokeWidth={2.5} />
      </div>
      {text && <h1 className="text-2xl font-extrabold tracking-tight text-foreground">{text}</h1>}
    </div>
  )
}
