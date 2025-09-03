import { ArrowLeft, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DOMPurify from 'dompurify';

interface Step {
  title: string;
  content: string;
  image?: string;
  tip?: string;
  warning?: string;
}

interface GuideContentProps {
  guide: {
    title: string;
    description: string;
    time: string;
    steps: Step[];
    category: string;
  };
  onBack: () => void;
}

export const GuideContent = ({ guide, onBack }: GuideContentProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à la documentation</span>
            </Button>
            <Badge variant="outline">{guide.category}</Badge>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto max-w-4xl px-6 py-12">
        {/* Title Section */}
        <div className="mb-12">
          <Badge variant="secondary" className="mb-4">
            Temps estimé: {guide.time}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">{guide.title}</h1>
          <p className="text-xl text-muted-foreground">{guide.description}</p>
        </div>

        {/* Steps */}
        <div className="space-y-8">
          {guide.steps.map((step, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                    <div className="prose prose-sm max-w-none text-muted-foreground mb-6">
                      <div dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(step.content, {
                          ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'ul', 'ol', 'li', 'a'],
                          ALLOWED_ATTR: ['href', 'target', 'rel']
                        })
                      }} />
                    </div>
                    
                    {step.image && (
                      <div className="mb-6">
                        <img 
                          src={step.image} 
                          alt={step.title}
                          className="rounded-lg border border-border w-full max-w-2xl"
                        />
                      </div>
                    )}

                    {step.tip && (
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Conseil</p>
                            <p className="text-sm text-blue-800 dark:text-blue-300">{step.tip}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {step.warning && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-200">Attention</p>
                            <p className="text-sm text-amber-800 dark:text-amber-300">{step.warning}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {index < guide.steps.length - 1 && (
                    <div className="absolute left-8 top-16 w-px h-16 bg-border"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Completion */}
        <Card className="mt-12 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-200 mb-2">
              Félicitations !
            </h3>
            <p className="text-green-800 dark:text-green-300">
              Vous avez terminé le guide "{guide.title}". Vous êtes maintenant prêt à utiliser cette fonctionnalité.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};