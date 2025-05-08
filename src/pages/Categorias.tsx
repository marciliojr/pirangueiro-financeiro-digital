
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderOpen } from "lucide-react";

const Categorias = () => {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Categorias</h1>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" /> 
            Gerenciamento de Categorias
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aqui você pode gerenciar suas categorias de receitas e despesas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categorias;
