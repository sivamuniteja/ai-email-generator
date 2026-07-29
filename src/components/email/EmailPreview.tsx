import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, Download, FileText, RefreshCw } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface EmailPreviewProps {
  email: string | null;
  subject: string | null;
  analysis?: any | null;
  isGenerating: boolean;
  onImprove?: (action: string) => void;
}

import { generatePDF } from "@/lib/pdfGenerator"

export function EmailPreview({ email, subject, analysis, isGenerating, onImprove }: EmailPreviewProps) {
  const { toast } = useToast()

  const handleCopy = () => {
    if (email) {
      navigator.clipboard.writeText(subject ? `Subject: ${subject}\n\n${email}` : email)
      toast({
        title: "Copied Successfully",
        description: "The email has been copied to your clipboard.",
      })
    }
  }

  const handleDownloadTXT = () => {
    if (!email) return;
    const element = document.createElement("a");
    const file = new Blob([subject ? `Subject: ${subject}\n\n${email}` : email], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "email.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  const handleDownloadPDF = () => {
    if (!email) return;
    try {
      generatePDF(subject, email);
    } catch (error) {
      toast({
        title: "Error Generating PDF",
        description: "There was a problem generating the PDF.",
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="shadow-sm h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Generated Email</CardTitle>
        <CardDescription>Your AI-crafted email will appear here</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        
        {isGenerating ? (
          <div className="space-y-4 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Separator />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full mt-4" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        ) : email ? (
          <div className="flex-1 flex flex-col">
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-1">Subject</p>
              <p className="font-medium">{subject || "No Subject"}</p>
            </div>
            
            <Separator className="my-4" />
            
            <div className="flex-1 whitespace-pre-wrap text-sm leading-relaxed">
              {email}
            </div>

            <Separator className="my-4" />
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div>
                <span className="font-semibold text-foreground">Reading Time</span>: {Math.ceil((email.trim().split(/\s+/).filter(Boolean).length / 200) * 60)} sec
              </div>
              <div>
                <span className="font-semibold text-foreground">Words</span>: {email.trim().split(/\s+/).filter(Boolean).length}
              </div>
              <div>
                <span className="font-semibold text-foreground">Characters</span>: {email.length}
              </div>
            </div>

            {analysis && (
              <div className="mb-4 bg-muted/30 rounded-lg p-4">
                <p className="text-sm font-semibold mb-3">AI Analysis</p>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  {Object.entries(analysis).map(([key, value]) => {
                    if (key === 'keywords') return null;
                    const val = typeof value === 'number' ? value : 0;
                    return (
                      <div key={key} className="flex justify-between items-center pr-4">
                        <span className="capitalize text-muted-foreground">{key}</span>
                        <span className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={star <= val ? "text-yellow-500" : "text-muted"}>★</span>
                          ))}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {analysis.keywords && Array.isArray(analysis.keywords) && (
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {analysis.keywords.map((kw: string) => (
                        <span key={kw} className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full">{kw}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="secondary" size="sm" onClick={() => onImprove?.('shorten')}>Shorten</Button>
              <Button variant="secondary" size="sm" onClick={() => onImprove?.('expand')}>Expand</Button>
              <Button variant="secondary" size="sm" onClick={() => onImprove?.('professional')}>Professional</Button>
              <Button variant="secondary" size="sm" onClick={() => onImprove?.('friendly')}>Friendly</Button>
              <Button variant="secondary" size="sm" onClick={() => onImprove?.('formal')}>Formal</Button>
              <Button variant="secondary" size="sm" onClick={() => onImprove?.('translate')}>Translate</Button>
              <Button variant="secondary" size="sm" onClick={() => onImprove?.('reply')}>Reply</Button>
            </div>

            <Separator className="mb-4" />

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleCopy} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleDownloadTXT} variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Download TXT
              </Button>
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="outline" size="sm" className="ml-auto">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg p-12 text-center">
            <p>No email generated yet.<br/>Fill out the form to create one.</p>
          </div>
        )}

      </CardContent>
    </Card>
  )
}
