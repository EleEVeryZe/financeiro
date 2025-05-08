import dayjs from "dayjs";
import { Registro } from "../interfaces/interfaces";
import { containsSalario, obterRestante, obterRestanteMenosInvestimento } from "../services/registros/registrosServices";

export class ChartData {
    data: Registro[];
    constructor(data: Registro[]) {
        this.data = data;
    }

    private readonly sumValor = (groupedByData: { [key: string]: Registro[] }) => {
        let acumulado = 0;
        return Object.keys(groupedByData).map((key) => 
            {
                acumulado += parseFloat(obterRestante(groupedByData[key]));
                return {
                    descricao: key,
                    valor: obterRestante(groupedByData[key]),
                    valorMenosInvestimento: obterRestanteMenosInvestimento(groupedByData[key]),
                    acumulado
                }
            }, {}
        )
    }

    private groupByDateItems = (data: Registro[]) => {
        return data.reduce((previousValue: { [key: string]: Registro[] } , currentValue) => {
            const dt = dayjs(currentValue.dtCorrente).format("YYYYMM");
            return {
                ...previousValue,
                [dt]: [
                    ...(previousValue[dt] && previousValue[dt].length ? previousValue[dt] : []),
                    currentValue
                ]
            }
        }
        , {});
    }

    public formatData = () : { data: { [key: string]: Registro[] }, sumValor: () => void, removeSalary: () => void } => {
        const groupedByData = this.groupByDateItems(this.data);

        return {
            data: groupedByData,
            sumValor: this.sumValor.bind(this, groupedByData),
            removeSalary: this.removeSalary.bind(this, groupedByData)
        }
    }

    /**
     * Exclui os registros anteriores a initMes atrás e posteriores a finMes a frente.
     * ex: init: 3 meses anteriores e fin: 4 posteriores =>  Se hoje fosse mes 6 iria mostrar no inicio março até outubro
     */
    public setMonthRange = (initMes: number, finMes: number) => {        
        const initDayJs = dayjs().subtract(initMes, "month");
        const finDayJs = dayjs().add(finMes, "month");
        this.data = this.data.filter(reg => dayjs(reg.dtCorrente).isAfter(initDayJs) && dayjs(reg.dtCorrente).isBefore(finDayJs));
        return this;
    }

    private readonly removeSalary = () => {
        this.data = this.data.filter(reg => !containsSalario(reg.descricao));
        return this;
    }

    private readonly getPassedHistory = (initMes: number) => {
        const initDayJs = dayjs().subtract(initMes, "month");
        const todaysMonth = dayjs().month();
        return this.data.filter(reg => dayjs(reg.dtCorrente).isAfter(initDayJs) && dayjs(reg.dtCorrente).isBefore(todaysMonth));
        
    }
}