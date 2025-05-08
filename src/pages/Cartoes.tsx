
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard } from "lucide-react";

const Cartoes = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Cartões</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" /> 
            Gerenciamento de Cartões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você pode gerenciar seus cartões de crédito</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Cartoes;
