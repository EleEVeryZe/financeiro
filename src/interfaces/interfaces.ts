import { Dayjs } from "dayjs";

export interface Registro {
    id: string;
    dtCorrente: Dayjs;
    descricao: string;
    valor: number;
    idComum?: string;
    fonte: string;
    categoria: string | null;
    qtdParc: number;
    parcelaAtual: number;
    comentario: string;
    ehPago: boolean;
    dtEfetiva?: string
}

export interface ChartData {
    
}