import { GraficoReceitasDespesasMensal } from "@/components/dashboard/GraficoReceitasDespesasMensal";

export function ExemploGraficoReceitasDespesas() {
    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Gráfico de Receitas x Despesas
                </h1>
                <p className="text-gray-600">
                    Exemplo de implementação do componente de gráfico mensal
                </p>
            </div>

            {/* Componente principal */}
            <GraficoReceitasDespesasMensal />

            {/* Documentação de uso */}
            <div className="bg-gray-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Como usar</h2>
                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium text-gray-900">Importação</h3>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`import { GraficoReceitasDespesasMensal } from "@/components/dashboard/GraficoReceitasDespesasMensal";`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900">Uso básico</h3>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`<GraficoReceitasDespesasMensal />`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900">Com className personalizada</h3>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`<GraficoReceitasDespesasMensal className="my-custom-class" />`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900">Funcionalidades</h3>
                        <ul className="list-disc list-inside text-gray-700 space-y-1 mt-2">
                            <li>Seleção de período com date pickers</li>
                            <li>Filtro "Últimos 12 Meses"</li>
                            <li>Alternância entre gráfico de linha e barras</li>
                            <li>Export em PNG, PDF e CSV</li>
                            <li>Tooltips informativos</li>
                            <li>Cards de resumo com totais</li>
                            <li>Estados de loading e erro</li>
                            <li>Layout responsivo</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900">API Endpoint</h3>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`GET /api/graficos/receitas-despesas
Parâmetros opcionais:
- dataInicio: YYYY-MM-DD
- dataFim: YYYY-MM-DD`}
                        </pre>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900">Resposta esperada da API</h3>
                        <pre className="bg-gray-800 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
{`{
  "dados": [
    {
      "mes": "2024-01",
      "totalReceitas": 5000.00,
      "totalDespesas": 3200.00,
      "saldo": 1800.00
    }
  ],
  "periodo": {
    "dataInicio": "2024-01-01",
    "dataFim": "2024-12-31"
  }
}`}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
} 