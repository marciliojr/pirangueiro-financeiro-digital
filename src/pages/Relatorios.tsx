
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileBarChart } from "lucide-react";

const Relatorios = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5" /> 
            Relatórios Financeiros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você pode visualizar relatórios e analisar seus dados financeiros</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Relatorios;
