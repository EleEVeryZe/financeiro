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
        

    private removeSalary = (groupedByData: { [key: string]: Registro[] }) => {
        this.data = this.data.filter(reg => reg.descricao !== "Salario");
        return this;
    }
}