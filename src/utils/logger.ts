type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  action: string;
  details?: unknown;
  userId?: string;
}

class Logger {
  private static instance: Logger;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  private formatLog(level: LogLevel, module: string, action: string, details?: unknown): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      module,
      action,
      details,
      userId: this.userId || 'anonymous'
    };
  }

  private writeLog(entry: LogEntry): void {
    const message = `[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.module}] ${entry.action}`;
    
    switch (entry.level) {
      case 'error':
        console.error(message, entry.details || '');
        break;
      case 'warn':
        console.warn(message, entry.details || '');
        break;
      case 'debug':
        console.debug(message, entry.details || '');
        break;
      default:
        console.log(message, entry.details || '');
    }
  }

  info(module: string, action: string, details?: unknown): void {
    const entry = this.formatLog('info', module, action, details);
    this.writeLog(entry);
  }

  warn(module: string, action: string, details?: unknown): void {
    const entry = this.formatLog('warn', module, action, details);
    this.writeLog(entry);
  }

  error(module: string, action: string, details?: unknown): void {
    const entry = this.formatLog('error', module, action, details);
    this.writeLog(entry);
  }

  debug(module: string, action: string, details?: unknown): void {
    const entry = this.formatLog('debug', module, action, details);
    this.writeLog(entry);
  }
}

// Instância única do logger
export const logger = Logger.getInstance();

// Helpers específicos para cada módulo
export const LogModules = {
  DASHBOARD: 'Dashboard',
  CONTAS: 'Contas',
  CATEGORIAS: 'Categorias',
  DESPESAS: 'Despesas',
  RECEITAS: 'Receitas',
  RELATORIOS: 'Relatorios',
  CONFIGURACOES: 'Configuracoes',
  CARTOES: 'Cartoes',
  AUTH: 'Auth',
  SYSTEM: 'System'
} as const;

export const LogActions = {
  // Ações comuns
  LOAD: 'carregando dados',
  LOAD_SUCCESS: 'dados carregados com sucesso',
  LOAD_ERROR: 'erro ao carregar dados',
  SAVE: 'salvando dados',
  SAVE_SUCCESS: 'dados salvos com sucesso',
  SAVE_ERROR: 'erro ao salvar dados',
  DELETE: 'excluindo item',
  DELETE_SUCCESS: 'item excluído com sucesso',
  DELETE_ERROR: 'erro ao excluir item',
  EXPORT: 'exportando dados',
  EXPORT_SUCCESS: 'exportação concluída',
  EXPORT_ERROR: 'erro na exportação',
  IMPORT: 'importando dados',
  IMPORT_SUCCESS: 'importação concluída',
  IMPORT_ERROR: 'erro na importação',
  
  // Ações específicas de autenticação
  LOGIN: 'realizando login',
  LOGIN_SUCCESS: 'login realizado com sucesso',
  LOGIN_ERROR: 'erro no login',
  LOGOUT: 'realizando logout',
  SESSION_EXPIRED: 'sessão expirada',
  
  // Ações de navegação
  PAGE_LOAD: 'página carregada',
  FORM_SUBMIT: 'formulário enviado',
  BUTTON_CLICK: 'botão clicado',
  
  // Ações específicas de relatórios
  GENERATE_PDF: 'gerando PDF',
  FILTER_APPLY: 'aplicando filtros',
  
  // Ações de configuração
  BACKUP_CREATE: 'criando backup',
  BACKUP_RESTORE: 'restaurando backup',
  DATA_CLEAR: 'limpando dados'
} as const; 