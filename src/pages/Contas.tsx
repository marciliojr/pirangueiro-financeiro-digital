
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Contas = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Contas</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> 
            Gerenciamento de Contas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você pode gerenciar suas contas bancárias</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Contas;
