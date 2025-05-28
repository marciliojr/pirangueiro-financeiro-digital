/**
 * Utilitários de formatação para o sistema financeiro
 */

/**
 * Formata um valor numérico como moeda brasileira
 */
export const formatarMoeda = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
};

/**
 * Formata uma string de mês (YYYY-MM) para formato abreviado (Jan/2024)
 */
export const formatarMes = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    return date.toLocaleDateString('pt-BR', {
        month: 'short',
        year: 'numeric'
    });
};

/**
 * Formata uma string de mês (YYYY-MM) para formato completo (Janeiro de 2024)
 */
export const formatarMesCompleto = (monthString: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    
    return date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric'
    });
};

/**
 * Formata uma data para o formato brasileiro (dd/mm/aaaa)
 */
export const formatarData = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Formata uma data para o formato ISO (YYYY-MM-DD)
 */
export const formatarDataISO = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

/**
 * Formata um número como percentual
 */
export const formatarPercentual = (value: number, decimals: number = 1): string => {
    return `${value.toFixed(decimals)}%`;
};

/**
 * Formata um número grande com separadores de milhares
 */
export const formatarNumero = (value: number): string => {
    return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Trunca um texto longo e adiciona reticências
 */
export const truncarTexto = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
};

/**
 * Capitaliza a primeira letra de cada palavra
 */
export const capitalizarTexto = (text: string): string => {
    return text.replace(/\w\S*/g, (txt) => 
        txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
};

/**
 * Gera uma cor baseada em um texto (útil para gráficos)
 */
export const gerarCorPorTexto = (text: string): string => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Converte dados para formato CSV
 */
export const converterParaCSV = (data: Record<string, unknown>[], headers: string[]): string => {
    const csvContent = [
        headers.join(','),
        ...data.map(row => 
            headers.map(header => {
                const value = row[header];
                // Escapar aspas e adicionar aspas se necessário
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value;
            }).join(',')
        )
    ].join('\n');
    
    return csvContent;
};

/**
 * Faz download de um arquivo
 */
export const downloadArquivo = (content: string, filename: string, mimeType: string = 'text/plain'): void => {
    const blob = new Blob([content], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};

/**
 * Calcula a diferença percentual entre dois valores
 */
export const calcularDiferencaPercentual = (valorAtual: number, valorAnterior: number): number => {
    if (valorAnterior === 0) return valorAtual > 0 ? 100 : 0;
    return ((valorAtual - valorAnterior) / valorAnterior) * 100;
};

/**
 * Determina a cor baseada no valor (positivo = verde, negativo = vermelho)
 */
export const obterCorPorValor = (valor: number): string => {
    if (valor > 0) return 'text-green-600';
    if (valor < 0) return 'text-red-600';
    return 'text-gray-600';
};

/**
 * Determina a cor de fundo baseada no valor
 */
export const obterCorFundoPorValor = (valor: number): string => {
    if (valor > 0) return 'bg-green-50';
    if (valor < 0) return 'bg-red-50';
    return 'bg-gray-50';
}; 