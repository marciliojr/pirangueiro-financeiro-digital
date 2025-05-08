
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal } from "lucide-react";

const Limites = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Limites de Gastos</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5" /> 
            Gerenciamento de Limites de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você pode configurar seus limites de gastos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Limites;
