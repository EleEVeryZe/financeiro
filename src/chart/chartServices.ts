import dayjs from "dayjs";
import { Registro } from "../interfaces/interfaces";
import { obterRestante, obterRestanteMenosInvestimento } from "../services/registros/registrosServices";

export class ChartData {
    data: Registro[];
    constructor(data: Registro[]) {
        this.data = data;
    }

    private sumValor = (groupedByData: { [key: string]: Registro[] }) => {
        return Object.keys(groupedByData).map((key) => 
            ({
                descricao: key,
                valor: obterRestante(groupedByData[key]),
                valorMenosInvestimento: obterRestanteMenosInvestimento(groupedByData[key])
            }), {}
        )
    }

    public groupByDateItems = () : { data: { [key: string]: Registro[] }, sumValor: () => void, removeSalary: () => void } => {
        const groupedByData = this.data.reduce((previousValue: { [key: string]: Registro[] } , currentValue) => {
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
        const today = dayjs();
        
        const initDayJs = dayjs().subtract(initMes, "month");
        const finDayJs = dayjs().add(finMes, "month");
        this.data = this.data.filter(reg => dayjs(reg.dtCorrente).isAfter(initDayJs) && dayjs(reg.dtCorrente).isBefore(finDayJs));
        return this;
    }

    private removeSalary = (groupedByData: { [key: string]: Registro[] }) => {
        this.data = this.data.filter(reg => reg.descricao !== "Salario");
        return this;
    }
}