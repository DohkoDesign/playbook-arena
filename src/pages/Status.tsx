import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, CheckCircle, AlertCircle, XCircle, Clock, Server, Database, Wifi, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Status = () => {
  const navigate = useNavigate();
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const services = [
    {
      name: "API Principal",
      description: "Services d'authentification et données principales",
      status: "operational",
      uptime: "99.9%",
      responseTime: "142ms",
      icon: Server
    },
    {
      name: "Base de données",
      description: "Stockage des données utilisateurs et équipes",
      status: "operational", 
      uptime: "99.8%",
      responseTime: "28ms",
      icon: Database
    },
    {
      name: "Interface Web",
      description: "Application web et dashboard",
      status: "operational",
      uptime: "99.9%",
      responseTime: "89ms",
      icon: Wifi
    },
    {
      name: "Système de notifications",
      description: "Notifications temps réel et emails",
      status: "operational",
      uptime: "99.7%",
      responseTime: "234ms",
      icon: Shield
    },
    {
      name: "Upload de fichiers",
      description: "Service d'upload de VODs et images",
      status: "maintenance",
      uptime: "99.5%",
      responseTime: "1.2s",
      icon: Activity
    }
  ];

  const incidents = [
    {
      title: "Maintenance programmée - Upload de fichiers",
      description: "Amélioration de la performance du système d'upload",
      status: "in-progress",
      date: new Date(),
      severity: "low"
    },
    {
      title: "Ralentissements résolus",
      description: "Problème de performance sur l'API résolu",
      status: "resolved",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      severity: "medium"
    },
    {
      title: "Mise à jour de sécurité",
      description: "Mise à jour de sécurité appliquée avec succès",
      status: "resolved", 
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      severity: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational": return "text-green-500";
      case "degraded": return "text-yellow-500";
      case "maintenance": return "text-blue-500";
      case "outage": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "degraded": return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "maintenance": return <Clock className="w-4 h-4 text-blue-500" />;
      case "outage": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "operational": return "Opérationnel";
      case "degraded": return "Dégradé";
      case "maintenance": return "Maintenance";
      case "outage": return "Hors service";
      default: return "Inconnu";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const overallStatus = services.every(s => s.status === "operational") ? "operational" : 
                       services.some(s => s.status === "outage") ? "outage" : "degraded";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </Button>
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold">Status</h1>
              </div>
            </div>
            <Badge variant="secondary">En temps réel</Badge>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="py-12 px-6 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            {getStatusIcon(overallStatus)}
            <h2 className="text-3xl md:text-4xl font-bold">Tous les systèmes sont opérationnels</h2>
          </div>
          <p className="text-xl text-muted-foreground mb-4">
            Surveillance en temps réel de nos services
          </p>
          <p className="text-sm text-muted-foreground">
            Dernière mise à jour: {lastUpdate.toLocaleString('fr-FR')}
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Services Status */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="w-5 h-5" />
                  <span>État des services</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <service.icon className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-muted-foreground">{service.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-right">
                          <div className="text-muted-foreground">Uptime</div>
                          <div className="font-medium">{service.uptime}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-muted-foreground">Réponse</div>
                          <div className="font-medium">{service.responseTime}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(service.status)}
                          <span className={`font-medium ${getStatusColor(service.status)}`}>
                            {getStatusText(service.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Métriques globales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">99.8%</div>
                    <div className="text-sm text-muted-foreground">Uptime global</div>
                  </div>
                  
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">156ms</div>
                    <div className="text-sm text-muted-foreground">Temps de réponse moyen</div>
                  </div>
                  
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">1.2k</div>
                    <div className="text-sm text-muted-foreground">Utilisateurs actifs</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/contact")}>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Signaler un problème
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    S'abonner aux mises à jour
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Incidents */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5" />
              <span>Incidents récents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {incidents.map((incident, index) => (
                <div key={index} className="flex items-start justify-between p-4 rounded-lg border border-border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium">{incident.title}</h4>
                      <Badge className={getSeverityColor(incident.severity)}>
                        {incident.severity === "low" ? "Faible" : incident.severity === "medium" ? "Moyen" : "Élevé"}
                      </Badge>
                      {incident.status === "resolved" ? (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Résolu
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-blue-600 border-blue-600">
                          En cours
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {incident.date.toLocaleDateString('fr-FR')} à {incident.date.toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};