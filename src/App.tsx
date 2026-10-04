import { BrowserRouter } from 'react-router-dom'
import { DocumentTitleSync } from '@/components/DocumentTitleSync'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AppRoutes } from '@/routes/AppRoutes'

export default function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <DocumentTitleSync />
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  )
}
