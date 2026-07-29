import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { EmailGenerator } from "@/components/email/EmailGenerator"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
        <Navbar />
        
        <main className="flex-1 container max-w-7xl mx-auto py-8 px-4 md:px-6">
          <EmailGenerator />
        </main>
        
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
