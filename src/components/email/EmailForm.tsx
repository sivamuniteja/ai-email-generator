import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { streamEmailWithBackend } from "@/lib/api"

const formSchema = z.object({
  purpose: z.string().min(1, { message: "Purpose is required." }),
  recipient: z.string().min(1, { message: "Recipient is required." }),
  sender: z.string().optional(),
  subject: z.string().min(1, { message: "Subject is required." }),
  context: z.string().min(1, { message: "Context is required." }),
  tone: z.string().min(1, { message: "Tone is required." }),
  length: z.string().min(1, { message: "Length is required." }),
  language: z.string().min(1, { message: "Language is required." }),
})

const purposes = [
  "Leave Request", "Job Application", "Follow Up", "Meeting Request", 
  "Resignation", "Complaint", "Appreciation", "Thank You", 
  "Business Proposal", "Apology", "Sales Pitch", "Networking", 
  "Support Request", "Invitation", "Reminder", "Promotion", "Custom"
]

const tones = [
  "Professional", "Formal", "Friendly", "Polite", "Confident", 
  "Persuasive", "Apologetic", "Appreciative", "Empathetic", "Casual"
]

interface EmailFormProps {
  setGeneratedEmail: (email: string | null) => void;
  setGeneratedSubject: (subject: string | null) => void;
  setGeneratedAnalysis: (analysis: any | null) => void;
  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;
  onGenerateSuccess?: (subject: string, body: string, purpose: string, analysis: any) => void;
}

export function EmailForm({ setGeneratedEmail, setGeneratedSubject, setGeneratedAnalysis, isGenerating, setIsGenerating, onGenerateSuccess }: EmailFormProps) {
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purpose: "",
      recipient: "",
      sender: "",
      subject: "",
      context: "",
      tone: "",
      length: "",
      language: "English",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsGenerating(true)
    setGeneratedSubject("")
    setGeneratedEmail("")
    
    let finalSubject = ""
    let finalBody = ""
    let finalAnalysis = null

    try {
      await streamEmailWithBackend(values, (fullText: string) => {
        let subject = ""
        let body = fullText
        let analysisData = null
        
        if (fullText.includes("ANALYSIS:\n")) {
          const parts = fullText.split("ANALYSIS:\n")
          body = parts[0]
          try {
            analysisData = JSON.parse(parts[1].trim())
          } catch (e) {
            // Still streaming json
          }
        }

        if (body.includes("BODY:\n")) {
          const parts = body.split("BODY:\n")
          subject = parts[0].replace("SUBJECT:", "").trim()
          body = parts[1].trimStart()
        } else if (body.includes("SUBJECT:")) {
          subject = body.replace("SUBJECT:", "").trim()
          body = ""
        }
        
        setGeneratedSubject(subject)
        setGeneratedEmail(body)
        if (analysisData) setGeneratedAnalysis(analysisData)
        
        finalSubject = subject
        finalBody = body
        if (analysisData) finalAnalysis = analysisData
      })
      onGenerateSuccess?.(finalSubject, finalBody, values.purpose, finalAnalysis)
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message || "An error occurred while generating the email.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTemplateClick = (template: Partial<z.infer<typeof formSchema>>) => {
    form.reset({
      purpose: template.purpose || "",
      recipient: template.recipient || "",
      sender: template.sender || "",
      subject: template.subject || "",
      context: template.context || "",
      tone: template.tone || "Professional",
      length: template.length || "Medium",
      language: "English",
    })
  }

  const templates = [
    { label: "🏢 Leave Request", purpose: "Leave Request", subject: "Leave Application", context: "I need leave on [Date] because of [Reason].", tone: "Professional", length: "Short" },
    { label: "💼 Job Application", purpose: "Job Application", subject: "Application for [Role]", context: "I am writing to apply for the [Role] position. Please find my resume attached.", tone: "Professional", length: "Medium" },
    { label: "🙏 Thank You", purpose: "Thank You", subject: "Thank You", context: "Thank you for your time and assistance.", tone: "Friendly", length: "Short" },
    { label: "📅 Meeting Request", purpose: "Meeting Request", subject: "Request for a Meeting", context: "I would like to schedule a meeting to discuss [Topic].", tone: "Formal", length: "Short" }
  ]

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Generate Email</CardTitle>
        <div className="flex flex-wrap gap-2 pt-4">
          {templates.map(t => (
            <Button 
              key={t.label} 
              variant="secondary" 
              size="sm" 
              onClick={() => handleTemplateClick(t)}
              type="button"
            >
              {t.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {purposes.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipient"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipient</FormLabel>
                    <FormControl>
                      <Input placeholder="Manager" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sender Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Context</FormLabel>
                    <FormControl>
                      <Input placeholder="Leave Request for Tomorrow" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write additional details... E.g., I am suffering from fever and need leave tomorrow." 
                      className="resize-none h-24"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="tone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tone</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tones.map((t) => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="length"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Length</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Short">Short</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Long">Long</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Hindi">Hindi</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                        <SelectItem value="Japanese">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" className="flex-1" disabled={isGenerating}>
                {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGenerating ? "Generating Email..." : "Generate Email"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => form.reset()}
                disabled={isGenerating}
              >
                Clear
              </Button>
            </div>
            
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
