import { Registro } from "@/src/interfaces/interfaces";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

const filterModule = (registros: Registro[], showPagos: boolean, setRegistros) => {
  const [filtros, setFiltros] = useState<{
    filtro_meses: string;
    filtro_descricao: string;
    filtro_fonte: string;
  }>({ filtro_meses: "", filtro_fonte: "", filtro_descricao: "" });

  const filterByMonths = () => {
    if (filtros.filtro_meses)
      return registros.filter(({ dtCorrente }) => {
        const aux = dayjs(dtCorrente).month();
        return (
          filtros.filtro_meses.split(";").indexOf(aux + 1 + "") !== -1 &&
          dayjs().year() === dayjs(dtCorrente).year()
        );
      });

    return registros;
  };

  const filterByDescricao = (filtered: Registro[]) => {
    if (filtros.filtro_descricao)
      return (Object.keys(filtered).length ? filtered : registros).filter(
        ({ descricao }) => {
          return (
            descricao
              .toLowerCase()
              .indexOf(filtros.filtro_descricao.toLowerCase()) !== -1
          );
        }
      );

    return filtered;
  };

  const filterByFonte = (filtered: Registro[]) => {
    if (filtros.filtro_fonte)
      filtered = (Object.keys(filtered).length ? filtered : registros).filter(
        ({ fonte }) => {
          return (
            fonte.toLowerCase().indexOf(filtros.filtro_fonte.toLowerCase()) !==
            -1
          );
        }
      );

    return filtered;
  };

  const filterEhPago = (filtered: Registro[]) => {
    if (!showPagos)
      filtered = (Object.keys(filtered).length ? filtered : registros).filter(
        ({ ehPago }) => {
          return ehPago === false || !ehPago;
        }
      );

    return filtered;
  };

  const sort = (data: Registro[]) => {
    return data.toSorted((a, b) => {
      if (a.dtCorrente.valueOf() < b.dtCorrente.valueOf()) return -1;
      if (a.dtCorrente.valueOf() > b.dtCorrente.valueOf()) return 1;
      return 0;
    });
  };

  useEffect(() => {
    let filtered = filterByMonths();
    filtered = filterByDescricao(filtered);
    filtered = filterByFonte(filtered);
    filtered = filterEhPago(filtered);

    setRegistros(sort(filtered));
  }, [filtros, showPagos]);

  return { filtros, setFiltros };
};

export default filterModule;
