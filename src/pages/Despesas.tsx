
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

const Despesas = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Despesas</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> 
            Gerenciamento de Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você pode gerenciar suas despesas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Despesas;
