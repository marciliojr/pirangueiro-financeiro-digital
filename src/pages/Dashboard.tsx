
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" /> 
            Bem-vindo ao PIRANGUEIRO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Sistema de controle financeiro</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
