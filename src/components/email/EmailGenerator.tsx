import { EmailForm } from "./EmailForm"
import { EmailPreview } from "./EmailPreview"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Star } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export type EmailRecord = {
  id: string;
  subject: string;
  body: string;
  purpose: string;
  date: string;
  isFavorite: boolean;
}

import { streamEmailImprovementWithBackend } from "@/lib/api"

export function EmailGenerator() {
  const [generatedEmail, setGeneratedEmail] = useState<string | null>(null)
  const [generatedSubject, setGeneratedSubject] = useState<string | null>(null)
  const [generatedAnalysis, setGeneratedAnalysis] = useState<any | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [history, setHistory] = useState<EmailRecord[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("email-history")
    if (saved) {
      try {
        setHistory(JSON.parse(saved))
      } catch (e) {}
    }
  }, [])

  const saveToHistory = (record: EmailRecord) => {
    const newHistory = [record, ...history].slice(0, 50) // keep last 50
    setHistory(newHistory)
    localStorage.setItem("email-history", JSON.stringify(newHistory))
  }

  const toggleFavorite = (id: string) => {
    const newHistory = history.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h)
    setHistory(newHistory)
    localStorage.setItem("email-history", JSON.stringify(newHistory))
  }

  const loadFromHistory = (record: EmailRecord) => {
    setGeneratedSubject(record.subject)
    setGeneratedEmail(record.body)
  }

  const handleImprove = async (action: string) => {
    if (!generatedEmail) return;
    setIsGenerating(true)
    try {
      await streamEmailImprovementWithBackend(generatedEmail, action, (chunk) => {
        setGeneratedEmail(chunk)
      })
    } catch (error: any) {
      // API error handled by toast in a global way or we can just log here
      console.error("Improvement failed", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              History & Favorites
            </Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto w-[400px] sm:w-[540px]">
            <SheetHeader>
              <SheetTitle>Email History</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {history.length === 0 && <p className="text-muted-foreground text-sm">No history yet.</p>}
              {history.map(record => (
                <div key={record.id} className="p-3 rounded-lg border bg-card text-card-foreground shadow-sm relative group cursor-pointer hover:border-primary transition-colors" onClick={() => loadFromHistory(record)}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{record.purpose}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 -mr-2 -mt-1"
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(record.id) }}
                    >
                      <Star className={`h-4 w-4 ${record.isFavorite ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{record.subject}</p>
                  <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EmailForm 
            setGeneratedEmail={setGeneratedEmail}
            setGeneratedSubject={setGeneratedSubject}
            setGeneratedAnalysis={setGeneratedAnalysis}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            onGenerateSuccess={(subject, body, purpose) => {
              saveToHistory({
                id: crypto.randomUUID(),
                subject,
                body,
                purpose,
                date: new Date().toISOString(),
                isFavorite: false
              })
            }}
          />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <EmailPreview 
            email={generatedEmail}
            subject={generatedSubject}
            analysis={generatedAnalysis}
            isGenerating={isGenerating}
            onImprove={handleImprove}
          />
        </motion.div>
      </div>
    </div>
  )
}
